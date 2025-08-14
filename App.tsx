import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from 'react-native';

export interface Game {
  id: string;
  title: string;
  platform: string;
  cover: string; // URL or local asset path; using emoji placeholder for now
}

function getSampleGames(): Game[] {
  return [
    { id: '1', title: 'Super Pixel Bros', platform: 'NES', cover: '🎮' },
    { id: '2', title: 'Blue Hedge Sprint', platform: 'Genesis', cover: '🦔' },
    { id: '3', title: 'Pocket Monsters', platform: 'GB', cover: '⚡' },
    { id: '4', title: 'Time of Heroes', platform: 'SNES', cover: '🛡️' },
    { id: '5', title: 'Racer 64', platform: 'N64', cover: '🏎️' },
    { id: '6', title: 'Street Fight', platform: 'Arcade', cover: '🥊' },
    { id: '7', title: 'Metroid Quest', platform: 'NES', cover: '👽' },
    { id: '8', title: 'Fantasy VII', platform: 'PS1', cover: '🌌' },
    { id: '9', title: 'Zeldor: Past Link', platform: 'SNES', cover: '🗡️' },
  ];
}

export default function App() {
  const [query, setQuery] = useState('');
  const { width } = useWindowDimensions();

  const allGames = useMemo(() => getSampleGames(), []);
  const filteredGames = useMemo(() => {
    if (!query.trim()) return allGames;
    const q = query.toLowerCase();
    return allGames.filter(
      g => g.title.toLowerCase().includes(q) || g.platform.toLowerCase().includes(q)
    );
  }, [allGames, query]);

  const numColumns = width >= 1200 ? 5 : width >= 900 ? 4 : width >= 640 ? 3 : 2;

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <Header />
      <ScrollView contentContainerStyle={styles.content}>
        <SearchBar query={query} onChange={setQuery} />
        <EmulatorPreview />
        <SectionTitle title="Popular Games" />
        <GameGrid games={filteredGames} columns={numColumns} />
      </ScrollView>
    </View>
  );
}

function Header() {
  return (
    <View style={styles.header}>
      <Text style={styles.brand}>EmuHub</Text>
      <View style={styles.headerRight}>
        <Pressable style={styles.headerButton} accessibilityRole="button">
          <Text style={styles.headerButtonText}>Library</Text>
        </Pressable>
        <Pressable style={styles.headerButton} accessibilityRole="button">
          <Text style={styles.headerButtonText}>Settings</Text>
        </Pressable>
      </View>
    </View>
  );
}

interface SearchBarProps {
  query: string;
  onChange: (v: string) => void;
}

function SearchBar({ query, onChange }: SearchBarProps) {
  return (
    <View style={styles.searchBar}>
      <TextInput
        value={query}
        onChangeText={onChange}
        placeholder="Search games or platforms..."
        placeholderTextColor="#7a7a7a"
        style={styles.searchInput}
        accessibilityLabel="Search games"
      />
      <Pressable style={styles.searchButton} accessibilityRole="button">
        <Text style={styles.searchButtonText}>Search</Text>
      </Pressable>
    </View>
  );
}

function EmulatorPreview() {
  return (
    <View style={styles.emuCard}>
      <View style={styles.emuScreen}>
        <Text style={styles.emuScreenText}>Emulator Ready</Text>
        <Text style={styles.emuScreenSub}>Select a game to start</Text>
      </View>
      <View style={styles.emuControls}>
        <Pressable style={[styles.ctrlBtn, styles.ctrlPrimary]} accessibilityRole="button">
          <Text style={styles.ctrlText}>Start</Text>
        </Pressable>
        <Pressable style={styles.ctrlBtn} accessibilityRole="button">
          <Text style={styles.ctrlText}>Reset</Text>
        </Pressable>
      </View>
    </View>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <Text style={styles.sectionTitle} accessibilityRole="header">
      {title}
    </Text>
  );
}

function GameGrid({ games, columns }: { games: Game[]; columns: number }) {
  return (
    <View style={[styles.grid, { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` as any }]}>
      {games.map(g => (
        <GameCard key={g.id} game={g} />
      ))}
    </View>
  );
}

function GameCard({ game }: { game: Game }) {
  return (
    <Pressable style={styles.card} accessibilityRole="button" accessibilityLabel={`Play ${game.title}`}>
      <View style={styles.cover}>
        <Text style={styles.coverEmoji}>{game.cover}</Text>
      </View>
      <View style={styles.cardInfo}>
        <Text numberOfLines={1} style={styles.cardTitle}>
          {game.title}
        </Text>
        <Text style={styles.cardMeta}>{game.platform}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0f1220',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 20,
  },
  header: {
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: '#0b0e1a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#22263a',
  },
  brand: {
    color: '#e2e8f0',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1a1f35',
  },
  headerButtonText: {
    color: '#cbd5e1',
    fontWeight: '600',
  },
  searchBar: {
    flexDirection: 'row',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#0b0f1f',
    borderWidth: 1,
    borderColor: '#242a42',
    color: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  searchButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#3b82f6',
    borderRadius: 10,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  emuCard: {
    backgroundColor: '#0b0f1f',
    borderWidth: 1,
    borderColor: '#242a42',
    borderRadius: 16,
    overflow: 'hidden',
  },
  emuScreen: {
    aspectRatio: 16 / 9,
    backgroundColor: '#11162b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emuScreenText: {
    color: '#cbd5e1',
    fontSize: 18,
    fontWeight: '700',
  },
  emuScreenSub: {
    color: '#94a3b8',
    marginTop: 4,
  },
  emuControls: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    backgroundColor: '#0b0e1a',
    borderTopWidth: 1,
    borderTopColor: '#242a42',
  },
  ctrlBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#1e293b',
  },
  ctrlPrimary: {
    backgroundColor: '#22c55e',
  },
  ctrlText: {
    color: '#0b0e1a',
    fontWeight: '800',
  },
  sectionTitle: {
    color: '#e2e8f0',
    fontSize: 18,
    fontWeight: '800',
  },
  grid: {
    display: 'grid', 
    gap: 12,
  },
  card: {
    backgroundColor: '#0b0f1f',
    borderWidth: 1,
    borderColor: '#242a42',
    borderRadius: 12,
    overflow: 'hidden',
  },
  cover: {
    height: 120,
    backgroundColor: '#11162b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverEmoji: {
    fontSize: 36,
    color: '#94a3b8',
  },
  cardInfo: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 2,
  },
  cardTitle: {
    color: '#e2e8f0',
    fontWeight: '700',
  },
  cardMeta: {
    color: '#94a3b8',
    fontSize: 12,
  },
});
gh auth logout