import { NextResponse } from "next/server"

interface RequestBody {
  image: string
}

interface Prediction {
  class_name: string
  confidence: number
}

interface ApiResponse {
  status: string
  top_prediction: Prediction
  all_predictions: Prediction[]
}

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json()

    if (!body.image) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 })
    }

    // This is where you would make the actual API call to your model
    // For now, we'll simulate a response

    // Simulated API response
    const mockResponse: ApiResponse = {
      status: "success",
      top_prediction: {
        class_name: "chayote_Vejiga",
        confidence: 50.89138746261597,
      },
      all_predictions: [
        {
          class_name: "chayote_Vejiga",
          confidence: 50.89138746261597,
        },
        {
          class_name: "fresa_MohoGris",
          confidence: 9.06871184706688,
        },
        {
          class_name: "manzana_Moteado",
          confidence: 8.140644431114197,
        },
        {
          class_name: "lima_Antracnosis",
          confidence: 6.798546761274338,
        },
        {
          class_name: "cafe_Roya",
          confidence: 6.422111392021179,
        },
      ],
    }

    // In a real application, you would replace the mock with:
    // const apiResponse = await fetch('your-actual-api-endpoint', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ image: body.image })
    // })
    // const data = await apiResponse.json()

    // Simulate a delay to mimic API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    return NextResponse.json(mockResponse)
  } catch (error) {
    console.error("Error processing request:", error)
    return NextResponse.json({ error: "Failed to process image" }, { status: 500 })
  }
}
