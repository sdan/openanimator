import { UseChatHelpers } from 'ai/react'

import { Button } from '@/components/ui/button'
import { ExternalLink } from '@/components/external-link'
import { IconArrowRight } from '@/components/ui/icons'

const exampleMessages = [
  {
    heading: 'Explain technical concepts from this PDF',
    message: `tell me the new advancements in material sciences from this paper and what they found https://cs.stanford.edu/people/zjl/pdf/lk99.pdf `
  },
  {
    heading: 'Summarize an article',
    message: 'Summarize the following article for a 2nd grader: \n explain and give bullet points on what its about https://cacm.acm.org/news/275684-historic-algorithms-help-unlock-shortest-path-problem-breakthrough/fulltext'
  },
  {
    heading: 'Tell me the most important points from this video',
    message: `Tell me the highlights about this video. Can I be friends with an Orca? \n https://www.youtube.com/watch?v=-NNwXROZ-48`
  }
]

export function EmptyScreen({ setInput }: Pick<UseChatHelpers, 'setInput'>) {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="rounded-lg border bg-background p-8">
        <h1 className="mb-2 text-lg font-semibold">
          Welcome to OpenAnimator!
        </h1>
        <p className="mb-2 leading-normal text-muted-foreground">
          This is a dedicated chat app made for OpenAnimator.
        </p>
        <p className="leading-normal text-muted-foreground">
          You can start a conversation here or try the following examples:
        </p>
        <div className="mt-4 flex flex-col items-start space-y-2">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              onClick={() => setInput(message.message)}
            >
              <IconArrowRight className="mr-2 text-muted-foreground" />
              {message.heading}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
