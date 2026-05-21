"use client";

import { useState } from "react";
import { Menu, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TableOfContents } from "@/components/book/table-of-contents";
import { ReadingProgress } from "@/components/book/reading-progress";

interface Chapter {
  slug: string;
  title: string;
  rank: number;
  certainty: "highest" | "high" | "medium" | "low" | "lowest";
}

export function BookLayout({
  chapters,
  children,
}: {
  chapters: Chapter[];
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <ReadingProgress />

      <div className="mx-auto flex w-full max-w-6xl">
        {/* Desktop sidebar */}
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 border-r border-border/40 lg:block">
          <ScrollArea className="h-full">
            <div className="py-4">
              <TableOfContents chapters={chapters} />
            </div>
          </ScrollArea>
        </aside>

        {/* Mobile TOC button */}
        <div className="fixed bottom-6 right-6 z-30 lg:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button
                  size="icon-lg"
                  className="size-12 rounded-full shadow-lg"
                  aria-label="目录"
                />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="border-b px-4 py-3">
                <SheetTitle className="flex items-center gap-2 text-base">
                  <BookOpen className="size-4 text-blue-600 dark:text-blue-400" />
                  章节目录
                </SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-4rem)]">
                <TableOfContents
                  chapters={chapters}
                  onNavigate={() => setMobileOpen(false)}
                />
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>

        {/* Main content area */}
        <div className="min-w-0 flex-1">
          <div className="mx-auto max-w-[760px] px-5 py-8 sm:px-8 md:py-12">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
