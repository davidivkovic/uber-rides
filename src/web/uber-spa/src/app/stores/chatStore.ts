import { action, state, createStore, computed } from 'usm-mobx'
import { send } from '@app/api/ws'
import { getAllChats, getChat, getClientChat } from '@app/api/chat'
import { OutboundMessages } from '@app/api/ws-messages/messages'
import { userStore } from './userStore'

class ChatStore {
  @state
  currentConversation: any

  @state
  allConversations: any

  @state
  failedConnection: boolean = false

  @computed
  get messages() {
    return this.currentConversation?.messages.slice().reverse() ?? []
  }

  @computed
  get allConversationsSorted() {
    return this.allConversations?.slice().sort((convo1: any, convo2: any) => {
      const date1 = new Date(convo1.messages[convo1.messages.length - 1].sentAt)
      const date2 = new Date(convo2.messages[convo2.messages.length - 1].sentAt)
      if (date1 > date2) return -1
      else if (date1 < date2) return 1
      return 0
    })
  }

  @action
  addConversation(conversation: any) {
    this.allConversations.push(conversation)
    // this.setCurrentConversation(this.currentConversation.id)
  }

  @action
  addMessageToConversation(id: string, message: any) {
    if (userStore.isAdmin) {
      console.log(this.allConversations?.find(convo => convo.id == id));
      this.allConversations?.find(convo => convo.id == id).messages.push(message)
      if(this.currentConversation.id == id) {
        this.addMessageToCurrentConversation(message)
      }
    } else {
      this.addMessageToCurrentConversation(message)
    }
  }

  @action
  setFailedConnection(value: boolean) {
    this.failedConnection = value
  }

  @action
  setAllConversations(conversation: any) {
    this.allConversations = conversation
  }

  @action
  setConversation(conversation: any) {
    this.currentConversation = conversation
  }

  @action
  addMessageToCurrentConversation(message: any) {
    this.currentConversation?.messages.push({ ...message })
  }

  @action
  closeConversation() {
    this.currentConversation.closed = true
    this.currentConversation.closedAt = new Date()
  }

  fetchAllConversations = async () => {
    const chats = await getAllChats()
    this.setAllConversations(chats)
  }

  setCurrentConversation = async (id: string = null) => {
    let conversation: any
    if (id !== null) {
      conversation = await getChat(id)
    } else if(!userStore.isAdmin) {
      try {
        conversation = await getClientChat()
      } catch (err) {
        conversation = null
      }
    }
    this.setConversation(conversation)
  }

  @action
  sendMessage(content: string, closeConversation: boolean = false) {
    send(OutboundMessages.MESSAGE_SENT, {
      content,
      closeConversation,
      conversationId: this.currentConversation?.id ?? null
    })
    const newMessage = {
      content,
      sender: { id: userStore.user.id },
      sentAt: Date.now()
    }
    if (closeConversation) {
      this.closeConversation()
      window.detector.detectChanges()
      return
    }
    this.addMessageToConversation(this.currentConversation?.id, newMessage)
    window.detector.detectChanges()
  }

  onMessage = async ({ message, conversationId, conversationEnd }) => {
    if(conversationId == null) {
      this.setFailedConnection(true)
      return window.router.navigate(['/live-support'])
    }

    this.setFailedConnection(false)

    if (conversationEnd) {
      return this.closeConversation()
    }

    if (userStore.isAdmin) {
      console.log(conversationId);
      const existing = this.allConversations.slice().filter(convo => convo.id === conversationId)
      console.log(existing);
      if (existing.length !== 0) {
        this.addMessageToConversation(conversationId, { ...message })
      } else {
        const newChat = await getChat(conversationId)
        console.log(newChat);
        this.addConversation(newChat)
      }
    } else {
      this.addMessageToCurrentConversation(message)
    }
  }
}

const chatStore = new ChatStore()

createStore({
  modules: [chatStore]
})

export { chatStore }
