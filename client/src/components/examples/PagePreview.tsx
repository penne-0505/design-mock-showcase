import { PagePreview } from "../PagePreview";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

function SamplePageContent() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Project Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This is a sample design brief demonstrating the layout and structure of a typical page in the showcase.
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Design Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Clean, minimal interface</li>
            <li>Strong typography hierarchy</li>
            <li>Responsive across devices</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PagePreviewExample() {
  return (
    <div className="h-[500px] border rounded-md overflow-hidden">
      <PagePreview
        name="Landing Page Brief"
        path="pages/landing.tsx"
        content={<SamplePageContent />}
        onBack={() => console.log("Back clicked")}
        breadcrumbItems={[
          { label: "Pages", onClick: () => console.log("Pages") },
          { label: "Landing Page Brief" },
        ]}
      />
    </div>
  );
}
