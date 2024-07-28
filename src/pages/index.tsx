import Layout from "@/components/Layout";

export const metadata = {
  title: 'Home',
  description: 'AI-powered D&D',
};

export default function Home() {
  const features = [
    {
      title: "Character Creation",
      desc: "We walk you through selecting your character's race, class, and background, step-by-step, making the process smooth and enjoyable.",
    },
    {
      title: "Gameplay Guidance",
      desc: "As your digital DM, I narrate the story, manage dice rolls, and respond to your actions, keeping the adventure flowing.",
    },
    {
      title: "Imagery",
      desc: "Custom images of characters, monsters, and settings to visualize your campaign vividly.",
    },
    {
      title: "Rules and Lore",
      desc: "Access comprehensive content from D&D 5e sources, offering gameplay advice, lore insights, and rule clarifications.",
    },
    {
      title: "Character Updates",
      desc: "Post-adventure, we help update your character sheet, tracking growth and planning future exploits.",
    },
    {
      title: "Narration",
      desc: "Receive story narration in a format suitable for text-to-speech tools, ensuring accessibility for all players.",
    },
    {
      title: "Dynamic Encounter Management",
      desc: "Easily manage encounters with a built-in system for tracking initiative, hit points, and status effects. Tailor encounters to suit your party&apos;s level and play style for a balanced and engaging challenge.",
    },
    {
      title: "Resource Integration",
      desc: "Seamlessly integrate with various D&D 5e resources, including spell lists, item catalogs, and rulebooks, providing quick access to essential information and enhancing your gameplay experience.",
    },
  ];
  return (
    <Layout data={metadata}>
      <section className="p-4 border border-accent">
            <div className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl font-extrabold sm:text-4xl">Welcome, traveler...</h2>
                <p className="mt-4 text-lg">
                  DMGPT-5e is your digital Dungeon Master for Dungeons & Dragons 5th Edition! Designed to provide a guided, step-by-step character creation process and immersive gameplay experience, DMGPT-5e ensures every adventure is engaging and accessible, whether you&apos;re a seasoned player or new to the world of D&D.
                </p>
              </div>
              <dl className="mt-12 space-y-10 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-4 lg:gap-x-8">
              {features && features.map((feature, i) => (
                <div key={i} className="flex">
                  <div className="ml-3">
                    <dt className="text-lg font-medium">{feature.title}</dt>
                    <dd className="mt-2 dark:text-gray-600">
                      {feature.desc}
                    </dd>
                  </div>
                </div>
              ))}
              </dl>
            </div>
         
      </section>
    </Layout>
  );
}

