'use client'

import * as React from 'react'
import { signIn } from 'next-auth/react'

import { cn } from '@/lib/utils'
import { Button, type ButtonProps } from '@/components/ui/button'
import { IconUser, IconSpinner } from '@/components/ui/icons'

interface LoginButtonProps extends ButtonProps {
  showGithubIcon?: boolean
  text?: string
}

export function LoginButton({
  text = 'Login to OpenAnimator',
  showGithubIcon = false,
  className,
  ...props
}: LoginButtonProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  return (
    <Button
      variant="outline"
      onClick={() => {
        setIsLoading(true)
        // next-auth signIn() function doesn't work yet at Edge Runtime due to usage of BroadcastChannel
        signIn('auth0', { callbackUrl: `/` })
      }}
      disabled={isLoading}
      className={cn(className, "text-10xl")} // Increase the size of the button text by 10 times
      {...props}
    >
      {isLoading ? (
        <IconSpinner className="mr-2 animate-spin text-10xl" /> // Increase the size of the spinner icon by 10 times
      ) : showGithubIcon ? (
        <IconUser className="mr-2 text-10xl" /> // Increase the size of the GitHub icon by 10 times
      ) : null}
      {text}

    </Button>
  )
}
