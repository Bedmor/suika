import Game from "@/components/Game";
import { RotateCcw } from "lucide-react-native";
import React, { useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function HomeScreen() {
  const [gameState, setGameState] = useState<"MENU" | "PLAYING" | "GAMEOVER">(
    "MENU"
  );
  const [finalScore, setFinalScore] = useState(0);
  const [gameKey, setGameKey] = useState(0);

  const startGame = () => {
    // bump key to force remount of Game (clears its internal state)
    setGameKey((k) => k + 1);
    setGameState("PLAYING");
  };
  function handeRestart() {
    // Force a fresh game instance by incrementing key and setting playing
    setGameKey((k) => k + 1);
    setGameState("PLAYING");
  }
  const handleGameOver = (score: number) => {
    setFinalScore(score);
    setGameState("GAMEOVER");
  };

  if (gameState === "PLAYING") {
    return (
      <>
        <TouchableOpacity style={styles.restartButton} onPress={handeRestart}>
          <RotateCcw />
        </TouchableOpacity>
        <Game key={gameKey} onGameOver={handleGameOver} />
      </>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require("../assets/images/background.png")}
        style={styles.background}
      />
      <View style={styles.content}>
        <Text style={styles.title}>SUIKA GAME</Text>
        <Text style={styles.subtitle}>by bedmor</Text>

        {gameState === "GAMEOVER" && (
          <Text style={styles.score}>Last Score: {finalScore}</Text>
        )}

        <TouchableOpacity style={styles.button} onPress={startGame}>
          <Text style={styles.buttonText}>
            {gameState === "GAMEOVER" ? "Play Again" : "Start Game"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    resizeMode: "cover",
    filter: "blur(5px)",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#FF6B6B",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 24,
    color: "#4ECDC4",
    marginBottom: 50,
  },
  score: {
    fontSize: 32,
    color: "#333",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
    elevation: 5,
  },
  restartButton: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
});
