import "./globals.css"
import "./global-animations.css"
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import { Inter } from "next/font/google"
import { CartProvider } from "@/context/CartContext"
import { SelectedItemsProvider } from "@/context/SelectedItemsContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Plant Haven - Premium Plants for Your Home",
  description:
    "Discover our curated collection of premium plants and trees to transform your space into a lush paradise.",
    generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            <SelectedItemsProvider>
              <Toaster position="top-center" />
              {children}
            </SelectedItemsProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
