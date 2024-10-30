import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, polygon } from '@reown/appkit/networks'
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient()

const projectId = 'f45b260e0cd3cd864bd01bfce0b5b456'

const metadata = {
  name: 'Gas Guardian',
  description: 'Gas monitoring and optimization tool',
  url: 'https://gasguardian.com',
  icons: ['https://your-icon-url.com/icon.png']
}

const networks = [mainnet, polygon]

export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true
})

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata
}) 