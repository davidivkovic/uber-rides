import { chatStore } from "@app/stores"

export default (message: {
  conversationEnd: boolean
  conversationId: string
  message: any
}) => {
    chatStore.onMessage(message)
    window.detector.detectChanges()
}
