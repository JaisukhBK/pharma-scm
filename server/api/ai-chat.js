import OpenAI from 'openai';
import { sql } from '../lib/db.js';
import { withAuth, apiSuccess, apiError, parseBody } from '../lib/middleware.js';
import { getAgent } from '../agents/definitions.js';

// Groq uses OpenAI-compatible API at api.groq.com
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1'
});

// ─── Tool execution — fetch real data via Neon SQL ──────────────
async function executeTool(toolName, toolInput) {
  switch (toolName) {
    case 'query_inventory': {
      const rows = await sql`SELECT i.*, row_to_json(p) as product, row_to_json(w) as warehouse
        FROM inventory i JOIN products p ON i.product_id=p.id JOIN warehouses w ON i.warehouse_id=w.id`;
      const items = rows.map(i => ({
        ...i, alert: i.quantity_on_hand <= i.reorder_point && i.reorder_point > 0
          ? (i.quantity_on_hand <= i.reorder_point * 0.25 ? 'critical' : 'warning') : null
      }));
      if (toolInput.alert_type && toolInput.alert_type !== 'all') {
        return items.filter(i => i.alert === toolInput.alert_type || (toolInput.alert_type === 'low_stock' && i.alert));
      }
      return items;
    }
    case 'analyze_utilization': {
      const wh = await sql`SELECT * FROM warehouses WHERE id = ${toolInput.warehouse_id}`;
      const zones = await sql`SELECT * FROM warehouse_zones WHERE warehouse_id = ${toolInput.warehouse_id}`;
      return { warehouse: wh[0], zones };
    }
    case 'query_shipments': {
      if (toolInput.status && toolInput.status !== 'all') {
        return await sql`SELECT s.*, row_to_json(c) as carrier FROM shipments s LEFT JOIN carriers c ON s.carrier_id=c.id WHERE s.status=${toolInput.status} ORDER BY s.created_at DESC`;
      }
      return await sql`SELECT s.*, row_to_json(c) as carrier FROM shipments s LEFT JOIN carriers c ON s.carrier_id=c.id ORDER BY s.created_at DESC`;
    }
    case 'carrier_analysis':
      return await sql`SELECT * FROM carriers WHERE is_active=true ORDER BY rating DESC`;
    case 'query_orders': {
      if (toolInput.status) {
        return await sql`SELECT o.*, row_to_json(c) as customer FROM orders o LEFT JOIN customers c ON o.customer_id=c.id WHERE o.status=${toolInput.status} ORDER BY o.ordered_at DESC`;
      }
      return await sql`SELECT o.*, row_to_json(c) as customer FROM orders o LEFT JOIN customers c ON o.customer_id=c.id ORDER BY o.ordered_at DESC`;
    }
    case 'fulfillment_analysis': {
      const days = toolInput.period_days || 30;
      const orders = await sql`SELECT status, total, priority, ordered_at, fulfilled_at FROM orders WHERE ordered_at > NOW() - INTERVAL '30 days'`;
      const fulfilled = orders.filter(o => o.status === 'delivered');
      return { total_orders: orders.length, fulfilled: fulfilled.length, fulfillment_rate: orders.length > 0 ? ((fulfilled.length / orders.length) * 100).toFixed(1) : 0 };
    }
    case 'query_kpis': {
      const [inv, ship, ord, wh] = await Promise.all([
        sql`SELECT COALESCE(SUM(quantity_on_hand),0) as total, COUNT(*) FILTER (WHERE quantity_on_hand <= reorder_point AND reorder_point > 0) as low FROM inventory`,
        sql`SELECT status, COUNT(*) as cnt FROM shipments GROUP BY status`,
        sql`SELECT status, COUNT(*) as cnt FROM orders GROUP BY status`,
        sql`SELECT AVG(current_utilization) as avg_util FROM warehouses`
      ]);
      return { inventory: { total_units: parseInt(inv[0]?.total || 0), low_stock: parseInt(inv[0]?.low || 0) },
        shipments: Object.fromEntries((ship||[]).map(s => [s.status, parseInt(s.cnt)])),
        orders: Object.fromEntries((ord||[]).map(o => [o.status, parseInt(o.cnt)])),
        warehouses: { avg_utilization: parseFloat(wh[0]?.avg_util || 0).toFixed(1) } };
    }
    case 'trend_analysis': {
      const months = toolInput.period_months || 6;
      return await sql`SELECT * FROM analytics_snapshots ORDER BY snapshot_date`;
    }
    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}

function buildOpenAITools(agentTools) {
  return agentTools.map(t => ({ type: 'function', function: { name: t.name, description: t.description, parameters: t.input_schema } }));
}

async function handler(req, res) {
  if (req.method !== 'POST') return apiError(res, 405, 'Method not allowed');
  const body = await parseBody(req);
  const { module, messages, conversation_id } = body;
  if (!module || !messages?.length) return apiError(res, 400, 'Missing module or messages');

  const agent = getAgent(module);
  try {
    const tools = agent.tools?.length > 0 ? buildOpenAITools(agent.tools) : undefined;
    const openaiMessages = [{ role: 'system', content: agent.systemPrompt }, ...messages.map(m => ({ role: m.role, content: m.content }))];

    let response = await groq.chat.completions.create({ model: agent.model, messages: openaiMessages, tools, tool_choice: tools ? 'auto' : undefined, max_tokens: 2048, temperature: 0.7 });
    let choice = response.choices[0];
    let loopMessages = [...openaiMessages];
    let maxIter = 5;

    while (choice.finish_reason === 'tool_calls' && maxIter-- > 0) {
      loopMessages.push(choice.message);
      for (const tc of choice.message.tool_calls) {
        const result = await executeTool(tc.function.name, JSON.parse(tc.function.arguments));
        loopMessages.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify(result) });
      }
      response = await groq.chat.completions.create({ model: agent.model, messages: loopMessages, tools, tool_choice: 'auto', max_tokens: 2048, temperature: 0.7 });
      choice = response.choices[0];
    }

    const finalText = choice.message?.content || 'No response generated.';

    // Save conversation
    const allMsgs = JSON.stringify([...messages, { role: 'assistant', content: finalText }]);
    if (conversation_id) {
      await sql`UPDATE ai_conversations SET messages=${allMsgs}::jsonb, updated_at=NOW() WHERE id=${conversation_id}`;
    } else {
      await sql`INSERT INTO ai_conversations (user_id, module, messages) VALUES (${req.user.id}, ${module}, ${allMsgs}::jsonb)`;
    }

    return apiSuccess(res, { response: finalText, agent: agent.name, module });
  } catch (err) {
    console.error('AI Agent error:', err);
    return apiError(res, 500, `AI Agent error: ${err.message}`);
  }
}
export default function(req, res) { return withAuth(req, res, handler); }
