import { Header } from "@/app/_components/client/layout/Header"
import { Footer } from "@/app/_components/server/layout/Footer"
import { HomePageClient } from "@/app/_components/client/home/HomePageClient"

export default function RootPage() {
  return (
    <>
      <Header />
      <HomePageClient />
      <Footer />
    </>
  )
}
