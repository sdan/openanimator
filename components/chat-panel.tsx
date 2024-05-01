import { type UseChatHelpers } from 'ai/react'
import { Button } from '@/components/ui/button'
import { PromptForm } from '@/components/prompt-form'
import { ButtonScrollToBottom } from '@/components/button-scroll-to-bottom'
import { IconRefresh, IconStop } from '@/components/ui/icons'
import { FooterText } from '@/components/footer'
import { useTheme } from 'next-themes' // Import the useTheme hook

export interface ChatPanelProps
  extends Pick<
    UseChatHelpers,
    | 'append'
    | 'isLoading'
    | 'reload'
    | 'messages'
    | 'stop'
    | 'input'
    | 'setInput'
  > {
  id?: string,
  functionCalled?: string
}

export function ChatPanel({
  id,
  isLoading,
  stop,
  append,
  reload,
  input,
  setInput,
  messages,
  functionCalled
}: ChatPanelProps) {
  const { theme } = useTheme() // Use the useTheme hook to get the current theme
  return (
    <div className="fixed inset-x-0 bottom-0 bg-gradient-to-b from-muted/10 from-10% to-muted/30 to-50%">
      <ButtonScrollToBottom />
      <div className="mx-auto sm:max-w-2xl sm:px-4">
        <div className='h-10 items-end justify-center gap-2 mb-2 flex'>
          {isLoading ? (
            <Button
              variant="outline"
              onClick={() => stop()}
              className="bg-background"
            >
              <IconStop className="mr-2" />
              Stop generating
            </Button>
          ) : (
            messages?.length > 0 && (
              <Button
                variant="outline"
                onClick={() => reload()}
                className="bg-background"
              >
                <IconRefresh className="mr-2" />
                Regenerate response
              </Button>
            )
          )}
        </div>
        <div className="h-10 items-center justify-center gap-2 mb-1 hidden md:flex">
          <p className="text-sm text-muted-foreground"> Active plugins: </p>
        <Button
            variant="outline"
            disabled
            className={functionCalled === 'generate_math_animation_code' ? (theme === 'dark' ? "bg-white text-black" : "bg-black text-white") : "bg-background"}
          >
            {functionCalled === 'generate_math_animation_code' ? "Generated Manim Code" : "Manim Generator"}
          </Button>
          <Button
            variant="outline"
            disabled
            className={functionCalled === 'render_math_animation_code' ? (theme === 'dark' ? "bg-white text-black" : "bg-black text-white") : "bg-background"}
          >
            {functionCalled === 'render_math_animation_code' ? "Rendered Manim Code" : "Manim Renderer"}
          </Button>

        </div>
        <div className="space-y-4 border-t bg-background px-4 py-2 shadow-lg sm:rounded-t-xl sm:border md:py-4">
          <PromptForm
            onSubmit={async value => {
              await append({
                id,
                content: value,
                role: 'user'
              })
            }}
            input={input}
            setInput={setInput}
            isLoading={isLoading}
          />
          <FooterText className="hidden sm:block" />
        </div>
      </div>
    </div>
  )
}
