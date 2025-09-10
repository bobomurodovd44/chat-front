'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import client, { Message, MessageData, User } from '@/lib/feathers-client'
import { Send, LogOut } from 'lucide-react'

// Form validation schema for messages
const messageSchema = z.object({
  text: z.string().min(1, 'Message cannot be empty').max(500, 'Message too long')
})

type MessageFormData = z.infer<typeof messageSchema>

export default function ChatPage() {
  const [user, setUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const form = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      text: ''
    }
  })

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try to authenticate using stored token
        const response = await client.reAuthenticate()
        if (response.user) {
          setUser(response.user)
          await loadMessages()
        } else {
          router.push('/login')
        }
      } catch (error) {
        console.error('Authentication check failed:', error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  // Load message history
  const loadMessages = async () => {
    try {
      const response = await client.service('messages').find({
        query: {
          $sort: { createdAt: 1 }
        }
      })
      
      // Messages should already have user data populated by the backend
      setMessages(response.data)
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  // Set up real-time message listening
  useEffect(() => {
    if (!user) return

    const messageService = client.service('messages')

    const handleNewMessage = (message: Message) => {
      // Message should already have user data populated by the backend
      setMessages(prev => [...prev, message])
    }

    messageService.on('created', handleNewMessage)

    return () => {
      messageService.off('created', handleNewMessage)
    }
  }, [user])

  const handleLogout = async () => {
    try {
      await client.logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const onSubmit = async (data: MessageFormData) => {
    if (!data.text.trim()) return

    try {
      setIsSending(true)
      await client.service('messages').create({
        text: data.text.trim()
      } as MessageData)
      
      form.reset()
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsSending(false)
    }
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <div className="max-w-4xl mx-auto w-full h-full flex flex-col px-4 sm:px-0">
        {/* Header */}
        <div className="flex-shrink-0">
          <Card className="rounded-b-none border-b-0 m-0">
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <CardTitle className="text-lg sm:text-xl">Chat Room</CardTitle>
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                  {user?.fullName || user?.email}
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Messages Area */}
        <div className="flex-1 min-h-0">
          <Card className="h-full rounded-none border-t-0 border-b-0 flex flex-col m-0">
            <CardContent className="flex-1 min-h-0 p-0">
              <ScrollArea className="h-full p-4">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message._id}
                        className={`flex gap-3 ${
                          message.userId === user?._id ? 'flex-row-reverse' : 'flex-row'
                        }`}
                      >
                        <Avatar className="w-8 h-8 mt-1 flex-shrink-0">
                          <AvatarFallback className="text-xs">
                            {message.user?.fullName 
                              ? getInitials(message.user.fullName)
                              : message.user?.email?.slice(0, 2).toUpperCase() || '?'
                            }
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`max-w-[85%] sm:max-w-[70%] min-w-0 ${
                            message.userId === user?._id ? 'text-right' : 'text-left'
                          }`}
                        >
                          <div
                            className={`inline-block px-4 py-2 rounded-lg break-words ${
                              message.userId === user?._id
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.text}</p>
                          </div>
                          <div className={`flex items-center gap-2 mt-1 ${
                            message.userId === user?._id ? 'justify-end' : 'justify-start'
                          }`}>
                            <span className="text-xs text-gray-500 truncate">
                              {message.user?.fullName || message.user?.email || 'Unknown User'}
                            </span>
                            <span className="text-xs text-gray-400 flex-shrink-0">
                              {formatTime(message.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Message Input */}
        <div className="flex-shrink-0">
          <Card className="rounded-t-none border-t-0 m-0">
            <CardContent className="p-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
                  <FormField
                    control={form.control}
                    name="text"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Type your message..."
                            disabled={isSending}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                form.handleSubmit(onSubmit)()
                              }
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isSending || !form.watch('text')?.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
