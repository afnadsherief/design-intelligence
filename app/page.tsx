import { Button } from "@/system";
import { Container } from "@/system";
import { Section, SectionHeader, SectionTitle, SectionDescription } from "@/system";

export default function Home() {
  return (
    <Section size="xl">
      <Container size="lg">
        <SectionHeader>
          <SectionTitle>Design Intelligence</SectionTitle>
          <SectionDescription>
            Institutional-grade design system built on a three-layer token architecture.
          </SectionDescription>
          <div className="flex items-center justify-center gap-4">
            <Button variant="default" size="lg">
              Get Started
            </Button>
            <Button variant="outline" size="lg">
              Documentation
            </Button>
          </div>
        </SectionHeader>
      </Container>
    </Section>
  );
}
