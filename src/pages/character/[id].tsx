import { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import type { InferGetServerSidePropsType } from 'next';
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { nextAuthConfig } from "@/lib/auth";
import { getPlayers } from "@/lib/services/player";
import Layout from "@/components/Layout";
import DnDCharacterStatsSheet from 'dnd-character-sheets';
import 'dnd-character-sheets/dist/index.css';


export const metadata = {
  title: 'Character Sheet',
  description: 'AI-powered D&D',
};

export async function getServerSideProps(context) {
  const { id } = context.query;
  
  const session = await getServerSession(context.req, context.res, nextAuthConfig);
  console.log('session', session);
  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }
  
  const user = await getUser(id);
  const players = await getPlayers(id);
  
  return {
    props: {
      u: user,
      p: players
    }
  }
}

export default function CharacterPage({ u, p }: { u: any, p: any }) {
  const [user, setUser] = useState<any>(u);
  const [players, setPlayers] = useState<any>(p);
  
  if (players.length > 0) {
    return (
      <Layout data={metadata}>
        <section className="p-4 border border-accent">
          <div className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <p>No characters yet!</p>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout data={metadata}>
      <section className="p-4 border border-accent">
        <div className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h4>{user.name}'s Character(s)</h4>
          </div>
          <div role="tablist" className="tabs tabs-lifted">
          {players && players.map((p, i) => (
            <input
              type="radio"
              name="character_tab"
              role="tab"
              className="tab"
              aria-label={p.name}
            />
            <div role="tabpanel" className="tab-content bg-base-100 border-base-300 rounded-box p-6">
              <DnDCharacterStatsSheet character={p} />
            </div>
          ))}
          </div>
          
        </div>
      </section>
    </Layout>
  );
}

