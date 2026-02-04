import { NextRequest } from 'next/server'
import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'
import {
  fetchSentinelData,
  fetchWeatherData,
  fetchDeforestationAlerts,
  fetchSoilData,
  getSpeciesRecommendations,
  calculateEcosystemImpact,
} from '@/lib/gis-tools'

// Initialize AI clients
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null
const genAI = process.env.GOOGLE_AI_API_KEY ? new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY) : null
const AI_PROVIDER = process.env.AI_PROVIDER || 'openai'

// GIS Expert Agent System Prompt
const SYSTEM_PROMPT = `You are HABITAT-AI, an expert Geospatial Intelligence Agent specialized in adaptive reforestation and ecosystem restoration. You have deep knowledge in:

1. **Remote Sensing & Satellite Analysis**: Interpreting NDVI, NDMI, and other vegetation indices from Sentinel-2 imagery to identify optimal afforestation sites.

2. **Climate & Weather Analysis**: Understanding how temperature, humidity, rainfall patterns, and seasonal variations affect tree growth and forest health.

3. **Soil Science**: Analyzing soil pH, NPK levels, organic matter content, texture, and drainage to recommend suitable species.

4. **Forest Ecology**: Knowledge of native and adaptive species, their growth patterns, carbon sequestration potential, and ecosystem services.

5. **Conservation & Sustainability**: Understanding deforestation patterns, biodiversity corridors, and sustainable land management practices.

**Your Communication Style:**
- Be precise and data-driven, always referencing actual metrics when available
- Explain complex geospatial concepts in accessible terms
- Proactively suggest analyses when you identify gaps in understanding
- Provide actionable recommendations backed by scientific reasoning
- When uncertain, clearly state limitations and suggest additional data collection

**Tool Usage Guidelines:**
- Use the satellite analysis tool to assess land suitability before making planting recommendations
- Always check weather data to understand current conditions
- Cross-reference deforestation alerts to identify at-risk areas
- Combine soil and climate data for comprehensive species recommendations

When users ask about a location, always gather comprehensive data using your tools before providing recommendations.`

// Tool definitions
const tools: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'analyzeSatellite',
      description: 'Analyze satellite imagery to identify optimal afforestation sites using NDVI and NDMI indices. Use this when the user wants to assess land suitability for planting.',
      parameters: {
        type: 'object',
        properties: {
          latitude: { type: 'number', description: 'Latitude of the center point' },
          longitude: { type: 'number', description: 'Longitude of the center point' },
          radiusKm: { type: 'number', description: 'Radius in kilometers to analyze', default: 5 },
        },
        required: ['latitude', 'longitude'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getWeather',
      description: 'Get current weather conditions and 5-day forecast for a location. Use this to understand climate conditions affecting tree growth.',
      parameters: {
        type: 'object',
        properties: {
          latitude: { type: 'number', description: 'Latitude' },
          longitude: { type: 'number', description: 'Longitude' },
        },
        required: ['latitude', 'longitude'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'checkDeforestation',
      description: 'Check for recent deforestation alerts in an area using Global Forest Watch data. Use this to identify at-risk areas or assess historical forest loss.',
      parameters: {
        type: 'object',
        properties: {
          latitude: { type: 'number', description: 'Latitude' },
          longitude: { type: 'number', description: 'Longitude' },
          radiusKm: { type: 'number', description: 'Radius in kilometers', default: 10 },
        },
        required: ['latitude', 'longitude'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'analyzeSoil',
      description: 'Analyze soil composition and properties for a location. Use this to understand soil suitability for different tree species.',
      parameters: {
        type: 'object',
        properties: {
          latitude: { type: 'number', description: 'Latitude' },
          longitude: { type: 'number', description: 'Longitude' },
        },
        required: ['latitude', 'longitude'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'recommendSpecies',
      description: 'Get species recommendations based on climate and soil conditions. Use this after gathering weather and soil data to suggest appropriate tree species.',
      parameters: {
        type: 'object',
        properties: {
          temperature: { type: 'number', description: 'Average temperature in Celsius' },
          humidity: { type: 'number', description: 'Average humidity percentage' },
          annualRainfall: { type: 'number', description: 'Estimated annual rainfall in mm' },
          soilPh: { type: 'number', description: 'Soil pH value' },
          soilNitrogen: { type: 'number', description: 'Soil nitrogen in mg/kg' },
          organicMatter: { type: 'number', description: 'Organic matter percentage' },
          suitabilityScore: { type: 'number', description: 'Site suitability score from satellite analysis', default: 50 },
        },
        required: ['temperature', 'humidity', 'annualRainfall', 'soilPh', 'soilNitrogen', 'organicMatter'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'predictImpact',
      description: 'Calculate predicted ecosystem impact of reforestation over time. Use this to show potential benefits of planting.',
      parameters: {
        type: 'object',
        properties: {
          areaHectares: { type: 'number', description: 'Area to be planted in hectares' },
          speciesList: { type: 'array', items: { type: 'string' }, description: 'List of species to be planted' },
          timelineYears: { type: 'number', description: 'Projection timeline in years', default: 10 },
        },
        required: ['areaHectares', 'speciesList'],
      },
    },
  },
]

// Tool execution function with improved error handling
async function executeTool(toolName: string, args: Record<string, unknown>) {
  console.log(`[Tool Execution] Starting ${toolName} with args:`, JSON.stringify(args))
  
  try {
    switch (toolName) {
      case 'analyzeSatellite': {
        const { latitude, longitude, radiusKm = 5 } = args as { latitude: number; longitude: number; radiusKm?: number }
        
        if (!latitude || !longitude) {
          throw new Error('Missing required parameters: latitude and longitude')
        }
        
        console.log(`[Tool] Fetching satellite data for ${latitude}, ${longitude}`)
        const data = await fetchSentinelData(latitude, longitude, radiusKm)
        
        return {
          success: true,
          analysis: {
            averageNDVI: data.ndviAvg.toFixed(3),
            averageNDMI: data.ndmiAvg.toFixed(3),
            suitabilityScore: data.suitabilityScore.toFixed(1),
            interpretation:
              data.suitabilityScore > 60
                ? 'High potential for afforestation'
                : data.suitabilityScore > 40
                  ? 'Moderate potential - may need soil amendments'
                  : 'Low potential - consider alternative interventions',
            optimalZones: data.optimalZones.slice(0, 5).map((z) => ({
              coordinates: `${z.lat.toFixed(4)}, ${z.lng.toFixed(4)}`,
              score: z.score.toFixed(1),
            })),
          },
        }
      }

      case 'getWeather': {
        const { latitude, longitude } = args as { latitude: number; longitude: number }
        
        if (!latitude || !longitude) {
          throw new Error('Missing required parameters: latitude and longitude')
        }
        
        console.log(`[Tool] Fetching weather data for ${latitude}, ${longitude}`)
        const weather = await fetchWeatherData(latitude, longitude)
        
        return {
          success: true,
          current: {
            temperature: `${weather.temperature.toFixed(1)}°C`,
            humidity: `${weather.humidity}%`,
            rainfall: `${weather.rainfall} mm`,
            windSpeed: `${weather.windSpeed} m/s`,
            conditions: weather.conditions,
          },
          forecast: weather.forecast.slice(0, 5).map((f) => ({
            date: f.date,
            temperature: `${f.temp.toFixed(1)}°C`,
            expectedRain: `${f.rain.toFixed(1)} mm`,
          })),
          assessment:
            weather.humidity > 60 && weather.temperature > 20
              ? 'Favorable conditions for planting'
              : weather.humidity < 40
                ? 'Dry conditions - irrigation may be needed'
                : 'Monitor conditions before planting',
        }
      }

      case 'checkDeforestation': {
        const { latitude, longitude, radiusKm = 10 } = args as { latitude: number; longitude: number; radiusKm?: number }
        
        if (!latitude || !longitude) {
          throw new Error('Missing required parameters: latitude and longitude')
        }
        
        console.log(`[Tool] Checking deforestation for ${latitude}, ${longitude}`)
        const alerts = await fetchDeforestationAlerts(latitude, longitude, radiusKm)
        
        return {
          success: true,
          summary: {
            totalAlertsLastYear: alerts.totalAlerts,
            alertsLast30Days: alerts.recentAlerts,
            trend:
              alerts.recentAlerts > alerts.totalAlerts / 12
                ? 'Increasing deforestation activity'
                : 'Stable or declining activity',
          },
          monthlyBreakdown: alerts.alertsByMonth.slice(0, 6),
          hotspots: alerts.hotspots.slice(0, 5).map((h) => ({
            location: `${h.lat.toFixed(4)}, ${h.lng.toFixed(4)}`,
            severity: h.severity,
            date: h.date,
          })),
          recommendation:
            alerts.recentAlerts > 10
              ? 'High priority area - consider immediate intervention and monitoring'
              : 'Monitor regularly - establish baseline before planting',
        }
      }

      case 'analyzeSoil': {
        const { latitude, longitude } = args as { latitude: number; longitude: number }
        
        if (!latitude || !longitude) {
          throw new Error('Missing required parameters: latitude and longitude')
        }
        
        console.log(`[Tool] Analyzing soil for ${latitude}, ${longitude}`)
        const soil = await fetchSoilData(latitude, longitude)
        
        return {
          success: true,
          properties: {
            pH: soil.ph.toFixed(1),
            nitrogen: `${soil.nitrogen.toFixed(0)} mg/kg`,
            phosphorus: `${soil.phosphorus.toFixed(0)} mg/kg`,
            potassium: `${soil.potassium.toFixed(0)} mg/kg`,
            organicMatter: `${soil.organicMatter.toFixed(1)}%`,
            texture: soil.texture,
            drainage: soil.drainage,
          },
          assessment: {
            phStatus:
              soil.ph >= 6.0 && soil.ph <= 7.5
                ? 'Optimal for most species'
                : soil.ph < 6.0
                  ? 'Acidic - consider lime application'
                  : 'Alkaline - may limit species selection',
            fertilityStatus:
              soil.nitrogen > 100
                ? 'Good nitrogen levels'
                : 'May need nitrogen supplementation',
            overallSuitability:
              soil.organicMatter > 2 ? 'Good' : 'May benefit from composting',
          },
        }
      }

      case 'recommendSpecies': {
        const { temperature, humidity, annualRainfall, soilPh, soilNitrogen, organicMatter, suitabilityScore = 50 } = args as {
          temperature: number
          humidity: number
          annualRainfall: number
          soilPh: number
          soilNitrogen: number
          organicMatter: number
          suitabilityScore?: number
        }
        
        if (!temperature || !humidity || !annualRainfall || !soilPh || !soilNitrogen || organicMatter === undefined) {
          throw new Error('Missing required parameters for species recommendation')
        }
        
        console.log(`[Tool] Recommending species for temp:${temperature}, humidity:${humidity}`)
        const recommendations = await getSpeciesRecommendations(
          { temperature, humidity, rainfall: annualRainfall / 365 },
          { ph: soilPh, nitrogen: soilNitrogen, organicMatter },
          suitabilityScore
        )
        
        return {
          success: true,
          topRecommendations: recommendations.slice(0, 5).map((s) => ({
            name: s.name,
            scientificName: s.scientificName,
            suitabilityScore: `${s.suitability}%`,
            waterRequirement: s.waterRequirement,
            carbonCapture: `${s.carbonCapture} kg/year`,
            growthRate: s.growthRate,
            droughtTolerance: `${s.droughtTolerance}%`,
            notes: s.notes,
          })),
          plantingStrategy:
            recommendations[0]?.suitability > 70
              ? 'Conditions favorable for direct planting'
              : 'Consider nursery establishment first',
        }
      }

      case 'predictImpact': {
        const { areaHectares, speciesList, timelineYears = 10 } = args as {
          areaHectares: number
          speciesList: string[]
          timelineYears?: number
        }
        
        if (!areaHectares || !speciesList || speciesList.length === 0) {
          throw new Error('Missing required parameters: areaHectares and speciesList')
        }
        
        console.log(`[Tool] Predicting impact for ${areaHectares} hectares over ${timelineYears} years`)
        const impact = await calculateEcosystemImpact(areaHectares, speciesList, timelineYears)
        
        return {
          success: true,
          projectedImpact: {
            carbonSequestration: `${impact.carbonSequestration} tons CO₂`,
            waterRetentionImprovement: `${impact.waterRetention}%`,
            biodiversityScore: `${impact.biodiversityScore}/100`,
            localTemperatureReduction: `${impact.temperatureReduction}°C`,
            airQualityImprovement: `${impact.aqiImprovement}% AQI reduction`,
          },
          timeline: `${timelineYears} years`,
          summary: `Planting ${areaHectares} hectares with ${speciesList.length} species could sequester ${impact.carbonSequestration} tons of CO₂ over ${timelineYears} years while improving local water retention by ${impact.waterRetention}%.`,
        }
      }

      default:
        throw new Error(`Unknown tool: ${toolName}`)
    }
  } catch (error) {
    console.error(`[Tool Execution] Error in ${toolName}:`, error)
    throw error
  }
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Invalid messages format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Check if any AI provider is configured
    if (!openai && !genAI) {
      // Return a helpful message instead of error
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        start(controller) {
          const helpMessage = {
            type: 'text',
            text: `👋 Hi! I'm HABITAT-AI, your GIS Expert Agent.

⚠️ **AI Chat Not Configured**

To enable AI-powered chat, you need to add an API key:

**Option 1: OpenAI (Recommended)**
1. Get API key: https://platform.openai.com/api-keys
2. Add to \`.env.local\`: \`OPENAI_API_KEY=sk-your-key\`

**Option 2: Google Gemini (Free Alternative)**
1. Get API key: https://makersuite.google.com/app/apikey
2. Add to \`.env.local\`: \`GOOGLE_AI_API_KEY=your-key\`
3. Add to \`.env.local\`: \`AI_PROVIDER=gemini\`

**For now, you can:**
- ✅ Use the map to explore Indian forest zones
- ✅ Click "Analyze Sector" to get satellite analysis
- ✅ View species recommendations and metrics
- ✅ Run calamity simulations

Restart the dev server after adding API keys!`,
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(helpMessage)}\n\n`))
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        },
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    }

    // Use OpenAI by default
    if (AI_PROVIDER === 'openai' && openai) {
      return await handleOpenAIChat(messages)
    } else if (AI_PROVIDER === 'gemini' && genAI) {
      return await handleGeminiChat(messages)
    } else if (openai) {
      // Fallback to OpenAI if available
      return await handleOpenAIChat(messages)
    } else if (genAI) {
      // Fallback to Gemini if available
      return await handleGeminiChat(messages)
    } else {
      throw new Error('No AI provider available')
    }
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

async function handleOpenAIChat(messages: Array<{ role: string; parts: Array<{ type: string; text: string }> }>) {
  if (!openai) {
    throw new Error('OpenAI not configured')
  }

  console.log('[AI Chat] Starting OpenAI chat with', messages.length, 'messages')

  // Convert messages to OpenAI format
  const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages.map((msg): OpenAI.Chat.ChatCompletionMessageParam => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.parts?.map(p => p.text).join('') || '',
    })),
  ]

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        let chatMessages = [...openaiMessages]
        let iterations = 0
        const maxIterations = 10
        let hasStreamedContent = false

        console.log('[AI Chat] Starting tool calling loop')

        while (iterations < maxIterations) {
          iterations++
          console.log(`[AI Chat] Iteration ${iterations}/${maxIterations}`)

          try {
            const response = await openai.chat.completions.create({
              model: 'gpt-4o',
              messages: chatMessages,
              tools,
              tool_choice: 'auto', // Let the model decide when to use tools
              temperature: 0.7,
              max_tokens: 2000,
            })

            const choice = response.choices[0]
            
            if (!choice || !choice.message) {
              console.error('[AI Chat] No choice or message in response')
              break
            }

            console.log('[AI Chat] Response finish_reason:', choice.finish_reason)
            console.log('[AI Chat] Has content:', !!choice.message.content)
            console.log('[AI Chat] Has tool_calls:', !!choice.message.tool_calls)

            // Stream assistant message if there's content
            if (choice.message.content) {
              console.log('[AI Chat] Streaming text content:', choice.message.content.substring(0, 100))
              const chunk = {
                type: 'text',
                text: choice.message.content,
              }
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`))
              hasStreamedContent = true
            }

            // Handle tool calls
            if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
              console.log(`[AI Chat] Processing ${choice.message.tool_calls.length} tool calls`)
              
              // Add assistant message with tool calls to history
              chatMessages.push(choice.message)

              // Execute each tool call
              for (const toolCall of choice.message.tool_calls) {
                const toolName = toolCall.function.name
                let args: Record<string, unknown>
                
                try {
                  args = JSON.parse(toolCall.function.arguments)
                  console.log(`[AI Chat] Tool: ${toolName}, Args:`, args)
                } catch (parseError) {
                  console.error(`[AI Chat] Failed to parse tool arguments:`, toolCall.function.arguments)
                  args = {}
                }

                // Stream tool invocation notification
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: 'tool-invocation',
                  toolName,
                  args,
                })}\n\n`))

                try {
                  console.log(`[AI Chat] Executing tool: ${toolName}`)
                  const result = await executeTool(toolName, args)
                  console.log(`[AI Chat] Tool ${toolName} succeeded`)

                  // Stream tool result
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                    type: 'tool-result',
                    toolName,
                    result,
                  })}\n\n`))

                  // Add tool result to chat history
                  chatMessages.push({
                    role: 'tool',
                    tool_call_id: toolCall.id,
                    content: JSON.stringify(result),
                  })
                } catch (toolError) {
                  console.error(`[AI Chat] Tool execution error for ${toolName}:`, toolError)
                  
                  const errorResult = {
                    success: false,
                    error: toolError instanceof Error ? toolError.message : 'Unknown error',
                    message: `Failed to execute ${toolName}. Using fallback data.`
                  }

                  // Stream error result
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                    type: 'tool-result',
                    toolName,
                    result: errorResult,
                  })}\n\n`))

                  // Add error to chat history so AI can handle it
                  chatMessages.push({
                    role: 'tool',
                    tool_call_id: toolCall.id,
                    content: JSON.stringify(errorResult),
                  })
                }
              }

              // Continue loop to get AI's response after tool execution
              continue
            }

            // Check finish reason
            if (choice.finish_reason === 'stop') {
              console.log('[AI Chat] Conversation complete (stop)')
              break
            } else if (choice.finish_reason === 'length') {
              console.log('[AI Chat] Response truncated due to length')
              const warningChunk = {
                type: 'text',
                text: '\n\n[Response truncated due to length limit]',
              }
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(warningChunk)}\n\n`))
              break
            } else if (choice.finish_reason === 'tool_calls') {
              console.log('[AI Chat] Finish reason is tool_calls, continuing loop')
              continue
            } else {
              console.log('[AI Chat] Unknown finish reason, breaking')
              break
            }
          } catch (iterationError) {
            console.error(`[AI Chat] Error in iteration ${iterations}:`, iterationError)
            
            // Stream error message to user
            const errorChunk = {
              type: 'text',
              text: `\n\n⚠️ An error occurred: ${iterationError instanceof Error ? iterationError.message : 'Unknown error'}`,
            }
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorChunk)}\n\n`))
            break
          }
        }

        if (iterations >= maxIterations) {
          console.warn('[AI Chat] Max iterations reached')
          const warningChunk = {
            type: 'text',
            text: '\n\n[Maximum tool calling iterations reached]',
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(warningChunk)}\n\n`))
        }

        if (!hasStreamedContent) {
          console.warn('[AI Chat] No content was streamed')
          const fallbackChunk = {
            type: 'text',
            text: 'I apologize, but I encountered an issue processing your request. Please try again.',
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(fallbackChunk)}\n\n`))
        }

        console.log('[AI Chat] Streaming complete')
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      } catch (error) {
        console.error('[AI Chat] Fatal streaming error:', error)
        
        // Try to send error message to client
        try {
          const errorChunk = {
            type: 'text',
            text: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorChunk)}\n\n`))
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        } catch (e) {
          console.error('[AI Chat] Failed to send error to client:', e)
        }
        
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

async function handleGeminiChat(messages: Array<{ role: string; parts: Array<{ type: string; text: string }> }>) {
  if (!genAI) {
    throw new Error('Gemini not configured')
  }

  const model = genAI.getGenerativeModel({ 
    model: 'gemini-pro',
    systemInstruction: SYSTEM_PROMPT,
  })

  // Convert messages to Gemini format
  const history = messages.slice(0, -1).map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: msg.parts.map(p => ({ text: p.text })),
  }))

  const lastMessage = messages[messages.length - 1]

  const chat = model.startChat({ history })
  const result = await chat.sendMessageStream(lastMessage.parts.map(p => p.text).join(''))

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of result.stream) {
          const text = chunk.text()
          if (text) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', text })}\n\n`))
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      } catch (error) {
        console.error('Gemini streaming error:', error)
        controller.error(error)
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
