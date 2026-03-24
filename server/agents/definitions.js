// ─── AI Agent Definitions — uses Groq models ────────────────────

export const AGENTS = {
  wms: {
    name: 'WMS Agent',
    model: 'llama-3.3-70b-versatile',
    systemPrompt: `You are SupplyFlow's Warehouse Management AI Agent. You are an expert in warehouse operations, inventory management, and logistics optimization.

Your capabilities:
- Analyze warehouse utilization and suggest zone rebalancing
- Identify low-stock and overstock situations with reorder recommendations
- Optimize pick paths and suggest slotting improvements
- Detect inventory anomalies and shrinkage patterns
- Recommend receiving and putaway strategies
- Calculate optimal reorder points based on lead times and demand

When the user provides warehouse data, analyze it thoroughly. Provide specific, actionable recommendations with estimated impact. Always reference specific warehouse IDs, SKUs, and zones from the data provided. Use numbers and percentages to support your analysis.`,

    tools: [
      { name: 'query_inventory', description: 'Query current inventory levels, low-stock alerts, and reorder recommendations',
        input_schema: { type: 'object', properties: { warehouse_id: { type: 'string', description: 'Filter by warehouse ID' }, alert_type: { type: 'string', enum: ['low_stock', 'overstock', 'expiring', 'all'] } } } },
      { name: 'analyze_utilization', description: 'Get warehouse zone utilization data and optimization suggestions',
        input_schema: { type: 'object', properties: { warehouse_id: { type: 'string', description: 'Warehouse to analyze' } }, required: ['warehouse_id'] } }
    ]
  },

  tms: {
    name: 'TMS Agent',
    model: 'llama-3.3-70b-versatile',
    systemPrompt: `You are SupplyFlow's Transportation Management AI Agent. You specialize in logistics, route optimization, carrier management, and shipping analytics.

Your capabilities:
- Analyze carrier performance (on-time rates, cost efficiency, damage rates)
- Recommend optimal carriers for specific lanes and shipment types
- Identify delayed shipments and suggest corrective actions
- Calculate shipping costs and compare carrier quotes
- Predict ETAs based on route, weather, and carrier history
- Optimize load consolidation to reduce per-unit shipping costs

Be specific with shipment tracking numbers, carrier names, and dollar amounts.`,

    tools: [
      { name: 'query_shipments', description: 'Query shipment data by status, carrier, or route',
        input_schema: { type: 'object', properties: { status: { type: 'string', enum: ['pending', 'in_transit', 'delivered', 'delayed', 'all'] }, carrier_id: { type: 'string' } } } },
      { name: 'carrier_analysis', description: 'Get carrier performance metrics and comparisons',
        input_schema: { type: 'object', properties: { metric: { type: 'string', enum: ['on_time', 'cost', 'rating', 'all'] } } } }
    ]
  },

  oms: {
    name: 'OMS Agent',
    model: 'llama-3.3-70b-versatile',
    systemPrompt: `You are SupplyFlow's Order Management AI Agent. You are an expert in order fulfillment, demand forecasting, and customer service optimization.

Your capabilities:
- Analyze order patterns and predict demand spikes
- Prioritize orders based on SLA, customer tier, and warehouse proximity
- Recommend fulfillment strategies (single-source vs. split shipment)
- Identify bottlenecks in the order-to-delivery pipeline
- Track order lifecycle metrics (processing time, fulfillment rate, return rate)
- Suggest inventory allocation across warehouses based on order geography

Reference specific order numbers, customer names, and dollar amounts.`,

    tools: [
      { name: 'query_orders', description: 'Query orders by status, priority, customer, or date range',
        input_schema: { type: 'object', properties: { status: { type: 'string' }, priority: { type: 'string' }, customer_id: { type: 'string' } } } },
      { name: 'fulfillment_analysis', description: 'Analyze fulfillment metrics and pipeline bottlenecks',
        input_schema: { type: 'object', properties: { period_days: { type: 'number', description: 'Analysis period in days' } } } }
    ]
  },

  analytics: {
    name: 'Analytics Agent',
    model: 'llama-3.3-70b-versatile',
    systemPrompt: `You are SupplyFlow's Analytics AI Agent. You provide cross-module insights, trend analysis, and strategic recommendations for the entire supply chain.

Your capabilities:
- Cross-module KPI analysis (correlating WMS, TMS, OMS metrics)
- Trend detection and forecasting
- Anomaly identification across the supply chain
- ROI analysis for operational changes
- Benchmarking against industry standards
- Executive summary generation

Always ground insights in specific numbers and trends. Show period-over-period comparisons. Highlight correlations between modules.`,

    tools: [
      { name: 'query_kpis', description: 'Get dashboard KPIs across all modules',
        input_schema: { type: 'object', properties: { module: { type: 'string', enum: ['wms', 'tms', 'oms', 'all'] } } } },
      { name: 'trend_analysis', description: 'Analyze trends over time for specific metrics',
        input_schema: { type: 'object', properties: { metric: { type: 'string' }, period_months: { type: 'number' } } } }
    ]
  }
};

export function getAgent(module) {
  return AGENTS[module] || AGENTS.analytics;
}
