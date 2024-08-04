import { prisma } from "@/lib/prisma";
import superjson from 'superjson';

export async function updatePlayer(p) {
  const player = await prisma.player.update({
    where: {
      AND: [
        {playerId: p.playerId},
        {roomId: p.roomId}
      ]
    },
    data: {
      avatar_url: p.avatar_url,
      class_level: p.class_level,
      race: p.race,
      background: p.background,
      alignment: p.alignment,
      experience: p.experience,
      inspiration: p.inspiration,
      proficiency_bonus: p.proficiency_bonus,
      strength: p.strength,
      dexterity: p.dexterity,
      constitution: p.constitution,
      intelligence: p.intelligence,
      wisdom: p.wisdom,
      charisma: p.charisma,
      armor_class: p.armor_class,
      initiative: p.initiative,
      speed: p.speed,
      hit_points_current: p.hit_points_current,
      hit_points_max: p.hit_points_max,
      temporary_hit_points: p.temporary_hit_points,
      hit_dice: p.hit_dice,
      death_saves_successes: p.deat_saves_successes,
      death_saves_failures: p.death_saves_failures,
      personality_traits: p.personality_traits,
      ideals: p.ideals,
      bonds: p.bonds,
      flaws: p.flaws,
      features_traits: p.features_traits,
      skills: p.skills,
      saving_throws: p.saving_throws,
      attacks_spells: p.attack_spells,
      equipment: p.equipment,
      languages: p.languages,
      annotations: p.annotations
    },
  });
  
  return player;
}

export async function getPlayers(uid: number) {
  return await prisma.player.findMany({
    where: { userId: uid }
  }) || {};
}

export async function getPlayer(uid: number, rid: number) {
  return await prisma.player.findFirst({
    where: {
      AND: [
        { userId: uid },
        { roomId: rid }
      ]
    }
  }) || {};
}








