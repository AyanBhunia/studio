import { GameBoard } from "@/components/game-board";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex h-screen w-screen items-center justify-center bg-background">
      <Card className="flex h-full w-full flex-col rounded-none border-0">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl tracking-wider text-primary sm:text-4xl md:text-5xl">
            Royal Grid Domination
          </CardTitle>
          <CardDescription className="font-body text-base">
            The last king standing wins the grid. Plan your moves wisely.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col items-center justify-center p-4">
          <GameBoard />
        </CardContent>
      </Card>
    </main>
  );
}
