import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TextInput, TouchableOpacity } from 'react-native';

export default function App() {
  const [pokes, setPokes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortType, setSortType] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc'); 

  const getPokemonData = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getAllPokemon = async () => {
    try {
      const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=500'); 
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const pokemonData = await response.json();

      const temporaryPokemon = await Promise.all(
        pokemonData.results.map(async (pokemon) => {
          const details = await getPokemonData(pokemon.url);
          return details;
        })
      );

      setPokes(temporaryPokemon);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    getAllPokemon();
  }, []);

  const toggleSortOrder = () => {
    
    if (sortOrder === 'asc') {
      setSortOrder('desc');
    } else {
      setSortOrder('asc');
    }
  };

  const filteredAndSortedPokes = pokes
    .filter((poke) => poke.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortType === 'id') {
        const order = sortOrder === 'asc' ? 1 : -1; 
        return order * (a.id - b.id);
      } else if (sortType === 'attack') {
        const order = sortOrder === 'asc' ? 1 : -1;
        return order * (a.stats.find((stat) => stat.stat.name === 'attack').base_stat - b.stats.find((stat) => stat.stat.name === 'attack').base_stat);
      } else if (sortType === 'speed') {
        const order = sortOrder === 'asc' ? 1 : -1;
        return order * (a.stats.find((stat) => stat.stat.name === 'speed').base_stat - b.stats.find((stat) => stat.stat.name === 'speed').base_stat);
      }
      return 0;
    });

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Pokémon"
          value={searchTerm}
          onChangeText={(text) => setSearchTerm(text)}
        />
      </View>
      <View style={styles.sortButtons}>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => {
            setSortType('id');
            toggleSortOrder();
          }}
        >
          <Text>ID {sortOrder === 'asc' ? '▲' : '▼'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => {
            setSortType('attack');
            toggleSortOrder();
          }}
        >
          <Text>Attack {sortOrder === 'asc' ? '▲' : '▼'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => {
            setSortType('speed');
            toggleSortOrder();
          }}
        >
          <Text>Speed {sortOrder === 'asc' ? '▲' : '▼'}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.cardContainer}>
        {loading ? (
          <Text>Loading...</Text>
        ) : (
          filteredAndSortedPokes.map((poke) => {
            return (
              <View key={poke.name} style={styles.card}>
                <Image
                  source={{ uri: poke.sprites.front_default }}
                  style={styles.image}
                />
                <Text style={styles.name}>{poke.name}</Text>
                <Text>ID: {poke.id}</Text>
                <Text>Type(s): {poke.types.map((type) => type.type.name).join(', ')}</Text>
                {poke.evolves_from_species && (
                  <Text>Evolves from: {poke.evolves_from_species.name}</Text>
                )}
                <Text>HP: {poke.stats.find((stat) => stat.stat.name === 'hp').base_stat}</Text>
                <Text>Attack: {poke.stats.find((stat) => stat.stat.name === 'attack').base_stat}</Text>
                <Text>Defense: {poke.stats.find((stat) => stat.stat.name === 'defense').base_stat}</Text>
                <Text>Speed: {poke.stats.find((stat) => stat.stat.name === 'speed').base_stat}</Text>
              </View>
            );
          })
        )}
      </ScrollView>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  sortButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  sortButton: {
    backgroundColor: '#D3D3D3',
    padding: 5,
    marginHorizontal: 5,
    borderRadius: 5,
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  card: {
    width: '92%',
    margin: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#D3D3D3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 100,
    height: 100,
  },
  name: {
    fontWeight: 'bold',
    marginTop: 5,
  },
});
