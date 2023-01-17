import { chatStore } from "@app/stores"
import { baseUrl, scheme } from ".."

export default async (message: {
  conversationEnd: boolean
  conversationId: string
  message: any
}) => {
  if (message.message.sender && !message.message.sender.profilePicture.startsWith('http')) {
    message.message.sender.profilePicture =
      scheme +
      baseUrl +
      message.message.sender.profilePicture
  }
  await chatStore.onMessage(message)
  window.detector.detectChanges()
}
