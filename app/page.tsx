"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, AlertCircle, Leaf } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { ThemeToggle } from "@/components/theme-toggle"

interface Prediction {
  class_name: string
  confidence: number
}

interface ApiResponse {
  status: string
  top_prediction: Prediction
  all_predictions: Prediction[]
}

export default function Home() {
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [base64Image, setBase64Image] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<ApiResponse | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    setResults(null)

    const file = e.target.files?.[0]
    if (!file) return

    // Validate file is an image
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPEG, PNG, etc.)")
      setImage(null)
      setPreview(null)
      setBase64Image(null)
      return
    }

    setImage(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Convert to base64
    const base64Reader = new FileReader()
    base64Reader.onload = () => {
      const result = base64Reader.result as string
      const base64 = result.split(',')[1] // Elimina "data:image/...;base64,"
      setBase64Image(base64)
    }
    base64Reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    if (!base64Image) return

    setIsLoading(true)
    setError(null)
    //console.log("img : ", base64Image)
    try {
      // Make API request
      const response = await fetch("https://api-agro-detect-production.up.railway.app/predict_base64", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: base64Image }),
      })

      if (!response.ok) {
        throw new Error("Failed to analyze image")
      }

      const data: ApiResponse = await response.json()
      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const formatClassName = (className: string) => {
    // Convert "chayote_Vejiga" to "Chayote - Vejiga"
    const [plant, disease] = className.split("_")
    return `${plant.charAt(0).toUpperCase() + plant.slice(1)} - ${disease}`
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex flex-col items-center max-w-3xl mx-auto">
        <div className="flex items-center justify-between w-full mb-8">
          <div className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold text-center">AGRO-DETECT</h1>
          </div>
          <ThemeToggle />
        </div>

        <Card className="w-full mb-8">
          <CardHeader>
            <CardTitle>Sube una imagen de una hoja</CardTitle>
            <CardDescription>Sube una imagen para clasificarla</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div
                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => document.getElementById("image-upload")?.click()}
              >
                {preview ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={preview || "/placeholder.svg"}
                      alt="Preview"
                      className="max-h-64 max-w-full object-contain mb-4"
                    />
                    <p className="text-sm text-gray-500">Click aqui para subir una imagen</p>
                  </div>
                ) : (
                  <div className="py-8 flex flex-col items-center">
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm font-medium">Click to upload an image</p>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF up to 10MB</p>
                  </div>
                )}
                <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleSubmit}
                disabled={!base64Image || isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? "Analyzing..." : "Analizar imagen"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {isLoading && (
          <div className="w-full mb-8">
            <p className="text-center mb-2">Analizando imagen...</p>
            <Progress value={45} className="h-2" />
          </div>
        )}

        {results && (
          <div className="w-full space-y-6">
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800">Mejor Prediccion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">{formatClassName(results.top_prediction.class_name)}</h3>
                  <span className="text-lg font-bold">{results.top_prediction.confidence.toFixed(2)}%</span>
                </div>
                {/* <Progress value={results.top_prediction.confidence} className="h-2 mt-2 bg-green-800" /> */}
                <div className="w-full bg-gray-600 rounded-full h-3.5 mt-4">
                          <div
                            className="bg-green-500 h-3.5 rounded-full"
                            style={{ width: `${results.top_prediction.confidence}%` }}
                          ></div>
                        </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Todas las Predicciones</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {results.all_predictions.map((prediction, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <span className="font-medium">{formatClassName(prediction.class_name)}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-600 rounded-full h-2.5">
                          <div
                            className="bg-green-600 h-2.5 rounded-full"
                            style={{ width: `${prediction.confidence}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold w-16 text-right">
                          {prediction.confidence.toFixed(2)}%
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  )
}
