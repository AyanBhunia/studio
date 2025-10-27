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
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4 sm:p-8">
      <Card className="w-full max-w-5xl shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl tracking-wider text-primary sm:text-4xl md:text-5xl">
            Royal Grid Domination
          </CardTitle>
          <CardDescription className="font-body text-base">
            The last king standing wins the grid. Plan your moves wisely.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GameBoard />
        </CardContent>
      </Card>
    </main>
  );
}
