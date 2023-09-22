import * as React from 'react'
import Link from 'next/link'

import { cn } from '@/lib/utils'
import { auth } from '@/auth'
import { clearChats } from '@/app/actions'
import { Button, buttonVariants } from '@/components/ui/button'
import { Sidebar } from '@/components/sidebar'
import { SidebarList } from '@/components/sidebar-list'
import {
  IconGitHub,
  IconNextChat,
  IconSeparator,
  IconVercel
} from '@/components/ui/icons'
import { SidebarFooter } from '@/components/sidebar-footer'
import { ThemeToggle } from '@/components/theme-toggle'
import { ClearHistory } from '@/components/clear-history'
import { UserMenu } from '@/components/user-menu'
import { LoginButton } from '@/components/login-button'


import Image from 'next/image';


export async function Header() {
  const session = await auth()
  // console.log("header session",session);
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-4 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
      <div className="flex items-center">
        {session?.user ? (
          <Sidebar>
            <React.Suspense fallback={<div className="flex-1 overflow-auto" />}>
              {/* @ts-ignore */}
              <SidebarList userId={session?.user?.id} />
            </React.Suspense>
            <SidebarFooter>
              <ThemeToggle />
              <ClearHistory clearChats={clearChats} />
            </SidebarFooter>
          </Sidebar>
        ) : (
          <>
            <Link href="/" target="_blank" rel="nofollow">
              <Image
                src="/chatwithpdf.png"
                alt="ChatWith"
                width={30}
                height={30}
                className='rounded-md'
              />
            </Link>
            <h1 className="font-semibold ml-3 text-lg text-stone-700">ChatWithPlugins</h1>
          </>
        )}
        {/* <div className="ml-2 flex items-center">
          <IconSeparator className="w-6 h-6 text-muted-foreground/50" />
          {session?.user ? (
            <UserMenu user={session.user} />
          ) : (
            <Button variant="link" asChild className="-ml-2">
              <Link href="/sign-in?callbackUrl=/">Login</Link>
            </Button>
          )}
        </div> */}
      </div>
      <div className="flex items-center justify-end space-x-2">
        <a
          target="_blank"
          href="https://plugins.sdan.io"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: 'outline' })) + ' hidden md:flex'}
        >
          <span className="">Support</span>
        </a>
        {/* <a
          href="https://chat.openai.com/"
          target="_blank"
          className={cn(buttonVariants())}
        >
          <span className="hidden sm:block">Use ChatGPT</span>
          <span className="sm:hidden">ChatGPT</span>
        </a> */}
        <LoginButton text='Login' showGithubIcon={true} className='text-10xl' />
      </div>
    </header>
  )
}
