import { cookies } from 'next/headers'
import { CardapioDigital } from "@/components/cardapio-digital"

export default async function Home() {
  const cookieStore = await cookies()
  const value = cookieStore.get('ab_hero')?.value
  const abVariant: 'A' | 'B' = value === 'B' ? 'B' : 'A'

  return (
    <main>
      <CardapioDigital abVariant={abVariant} />
    </main>
  )
}
