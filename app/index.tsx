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
        blurRadius={10}
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
  },
  container: {
    flex: 1,
    backgroundColor: "#fdf6e3",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  title: {
    fontSize: 56,
    fontWeight: "900",
    color: "#5d4037",
    marginBottom: 5,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#8d6e63",
    marginBottom: 60,
    letterSpacing: 2,
  },
  score: {
    fontSize: 32,
    fontWeight: "900",
    color: "#5d4037",
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#5d4037",
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 1,
  },
  restartButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 100,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 10,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#5d4037",
  },
});
