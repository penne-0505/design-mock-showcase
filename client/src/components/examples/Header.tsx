import { Header } from "../Header";

export default function HeaderExample() {
  return <Header onOpenConfig={() => console.log("Open config clicked")} />;
}
