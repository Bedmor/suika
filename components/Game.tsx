import { DEADLINE_Y, FRUITS, pickWeightedIndex } from "@/constants/game";
import { Physics } from "@/systems/Physics";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import Matter from "matter-js";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  ImageBackground,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { GameEngine } from "react-native-game-engine";
import { DeadlineRenderer, WallRenderer } from "./game/renderers";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function Game({
  onGameOver,
}: {
  onGameOver: (score: number) => void;
}) {
  const [score, setScore] = useState(0);
  const [nextFruitIndex, setNextFruitIndex] = useState(0);
  const [maxFruitIndex, setMaxFruitIndex] = useState(0);
  const gameEngineRef = useRef<any>(null);
  const [entities, setEntities] = useState<any>(null);
  const entitiesRef = useRef<any>(null);
  const [running, setRunning] = useState(true);
  const [engineReady, setEngineReady] = useState(false);
  const engineReadyRef = useRef(false);
  const nextFruitIndexRef = useRef(0);
  const maxFruitIndexRef = useRef(0);

  useEffect(() => {
    setNextFruitIndex(pickWeightedIndex(3));
    setupWorld();
  }, []);

  useEffect(() => {
    entitiesRef.current = entities;
  }, [entities]);

  useEffect(() => {
    nextFruitIndexRef.current = nextFruitIndex;
  }, [nextFruitIndex]);

  useEffect(() => {
    maxFruitIndexRef.current = maxFruitIndex;
  }, [maxFruitIndex]);

  // Load merge pop sound
  const popSoundRef = useRef<any>(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require("../assets/pop-402324.mp3"),
          { shouldPlay: false }
        );
        if (mounted) popSoundRef.current = sound;
      } catch (err) {
        console.warn("Failed to load pop sound", err);
      }
    })();

    return () => {
      mounted = false;
      if (popSoundRef.current) {
        popSoundRef.current.unloadAsync().catch(() => {});
        popSoundRef.current = null;
      }
    };
  }, []);

  const setupWorld = () => {
    // Reset readiness until the GameEngine actually starts.
    setEngineReady(false);
    engineReadyRef.current = false;

    const engine = Matter.Engine.create({ enableSleeping: false });
    // Ensure there's a reasonable gravity so spawned fruits fall
    const world = engine.world;
    engine.world.gravity.y = 0.98;
    engine.world.gravity.scale = 0.00098;
    // Increase solver iterations to reduce tunneling through thin walls
    engine.positionIterations = 10;
    engine.velocityIterations = 8;
    engine.constraintIterations = 4;
    // @ts-ignore
    engine.mergeQueue = [];

    // Enqueue fruit-fruit collisions via collisionStart to avoid per-frame broad-phase scans
    Matter.Events.on(engine, "collisionStart", (event: any) => {
      if (!event || !event.pairs) return;
      event.pairs.forEach((pair: any) => {
        const { bodyA, bodyB } = pair;
        if (
          bodyA &&
          bodyB &&
          bodyA.label === "Fruit" &&
          bodyB.label === "Fruit"
        ) {
          // @ts-ignore
          engine.mergeQueue.push({ bodyA, bodyB });
        }
      });
    });

    // Walls
    const FLOOR_HEIGHT = 200;
    const WALL_THICKNESS = 50;
    const WALL_HALF = WALL_THICKNESS / 2;

    const floor = Matter.Bodies.rectangle(
      SCREEN_WIDTH / 2,
      SCREEN_HEIGHT + FLOOR_HEIGHT / 2 - 60,
      SCREEN_WIDTH,
      FLOOR_HEIGHT,
      { isStatic: true, label: "Floor" }
    );
    // Position walls so their inner edges sit at the visible screen edges
    const leftWall = Matter.Bodies.rectangle(
      WALL_HALF,
      SCREEN_HEIGHT / 2,
      WALL_THICKNESS,
      SCREEN_HEIGHT,
      { isStatic: true, label: "Wall" }
    );
    const rightWall = Matter.Bodies.rectangle(
      SCREEN_WIDTH - WALL_HALF,
      SCREEN_HEIGHT / 2,
      WALL_THICKNESS,
      SCREEN_HEIGHT,
      { isStatic: true, label: "Wall" }
    );

    Matter.World.add(world, [floor, leftWall, rightWall]);

    setEntities({
      physics: { engine, world },
      deadline: { renderer: DeadlineRenderer },
      floor: {
        body: floor,
        size: [SCREEN_WIDTH, FLOOR_HEIGHT],
        color: "#000000",
        renderer: WallRenderer,
      },
      leftWall: {
        body: leftWall,
        size: [WALL_THICKNESS, SCREEN_HEIGHT],
        color: "#000000",
        renderer: WallRenderer,
      },
      rightWall: {
        body: rightWall,
        size: [WALL_THICKNESS, SCREEN_HEIGHT],
        color: "#000000",
        renderer: WallRenderer,
      },
    });

    console.log("[setupWorld] entities set", {
      queued: pendingSpawnsRef.current.length,
    });
  };

  // kept for possible external usage (spawns at given page coordinates)

  const [, setGesturePos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const pendingSpawnsRef = useRef<number[]>([]);

  // Spam protection: cooldown + sliding window rate limit
  const SPAWN_COOLDOWN = 200; // ms minimum between spawns
  const SPAWN_WINDOW_MS = 1000; // sliding window length
  const MAX_SPAWNS_PER_WINDOW = 6; // max spawns allowed in window
  const lastSpawnRef = useRef<number>(0);
  const spawnTimestampsRef = useRef<number[]>([]);

  const draggingFruitRef = useRef<{
    id: string;
    body: any;
    fruitIndex: number;
  } | null>(null);

  const clampSpawnX = (x: number, radius: number) => {
    const WALL_THICKNESS = 50;
    const WALL_HALF = WALL_THICKNESS / 2;
    let clamped = x;
    if (clamped < radius + WALL_HALF) clamped = radius + WALL_HALF;
    if (clamped > SCREEN_WIDTH - radius - WALL_HALF) {
      clamped = SCREEN_WIDTH - radius - WALL_HALF;
    }
    return clamped;
  };

  const dragSpawnY = (radius: number) => {
    let y = DEADLINE_Y - 30;
    return y;
  };

  const beginDragFruit = (x: number) => {
    if (!engineReadyRef.current) return;
    if (draggingFruitRef.current) return;

    const currentEntities = entitiesRef.current;
    if (!currentEntities?.physics?.world) return;
    if (
      !gameEngineRef.current ||
      typeof gameEngineRef.current.dispatch !== "function"
    ) {
      return;
    }

    // Spam protection: cooldown and rate-limit
    const now = Date.now();
    if (now - lastSpawnRef.current < SPAWN_COOLDOWN) {
      // Too soon since last spawn
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch {
        // ignore
      }
      return;
    }
    // Sliding window: allow up to MAX_SPAWNS_PER_WINDOW within SPAWN_WINDOW_MS
    spawnTimestampsRef.current = spawnTimestampsRef.current.filter(
      (t) => now - t < SPAWN_WINDOW_MS
    );
    if (spawnTimestampsRef.current.length >= MAX_SPAWNS_PER_WINDOW) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch {
        // ignore
      }
      return;
    }
    spawnTimestampsRef.current.push(now);
    lastSpawnRef.current = now;

    const index = nextFruitIndexRef.current;
    const radius = FRUITS[index].radius;

    // Update the "Next" UI immediately while dragging
    const maxDrop = Math.min(maxFruitIndexRef.current, 3);
    setNextFruitIndex(pickWeightedIndex(maxDrop));

    const spawnX = clampSpawnX(x, radius);
    const spawnY = dragSpawnY(radius);

    const body = Matter.Bodies.circle(spawnX, spawnY, radius, {
      label: "Fruit",
      restitution: 0.2,
      friction: 0.1,
    });
    // @ts-ignore
    body.fruitIndex = index;
    // @ts-ignore
    body.isSpawning = true;
    body.isStatic = true; // Temporarily disable physics interactions

    Matter.World.add(currentEntities.physics.world, body);

    const id = `fruit_${Date.now()}_${Math.random()}`;
    draggingFruitRef.current = { id, body, fruitIndex: index };
    gameEngineRef.current.dispatch({ type: "ADD_BODY", body, id });
  };

  const moveDraggedFruit = (x: number) => {
    const active = draggingFruitRef.current;
    if (!active) return;

    const radius = active.body.circleRadius ?? FRUITS[active.fruitIndex].radius;
    const newX = clampSpawnX(x, radius);
    const newY = dragSpawnY(radius);

    Matter.Body.setPosition(active.body, { x: newX, y: newY });
    Matter.Body.setVelocity(active.body, { x: 0, y: 0 });
    Matter.Body.setAngularVelocity(active.body, 0);
  };

  const releaseDraggedFruit = (x: number) => {
    const active = draggingFruitRef.current;
    if (!active) return;
    const radius = active.body.circleRadius ?? FRUITS[active.fruitIndex].radius;
    const newX = clampSpawnX(x, radius);
    const newY = dragSpawnY(radius);
    Matter.Body.setStatic(active.body, false);
    Matter.Body.setVelocity(active.body, { x: 0, y: 0 });
    Matter.Body.setPosition(active.body, {
      x: newX,
      y: newY,
    });

    try {
      const forcePoint = {
        x: active.body.position.x + (Math.random() - 0.5) * radius,
        y: active.body.position.y,
      };
      Matter.Body.applyForce(active.body, forcePoint, {
        x: (Math.random() - 0.5) * 0.0006,
        y: 0.0005,
      });
      // Give a small random spin
      Matter.Body.setAngularVelocity(active.body, (Math.random() - 0.5) * 0.4);
    } catch {
      // ignore
    }

    draggingFruitRef.current = null;
  };

  // PanResponder to track gestures and spawn fruits at gesture points (on release)
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt) => engineReadyRef.current,
      onMoveShouldSetPanResponder: (evt) => engineReadyRef.current,
      onPanResponderGrant: (evt) => {
        const x = evt.nativeEvent.pageX ?? SCREEN_WIDTH / 2;
        const y = evt.nativeEvent.pageY ?? DEADLINE_Y;
        setGesturePos({ x, y });
        beginDragFruit(x);
      },
      onPanResponderMove: (evt) => {
        const x = evt.nativeEvent.pageX;
        const y = evt.nativeEvent.pageY;
        setGesturePos({ x, y });
        if (typeof x === "number") moveDraggedFruit(x);
      },
      onPanResponderRelease: (evt) => {
        const x = evt.nativeEvent.pageX;
        releaseDraggedFruit(x);
        setGesturePos({ x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT / 2 });
      },
      onPanResponderTerminate: (evt) => {
        const x = evt.nativeEvent.pageX;

        releaseDraggedFruit(x);
        setGesturePos({ x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT / 2 });
      },
    })
  ).current;

  return (
    <View style={styles.container} {...pan.panHandlers}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <ImageBackground
          source={require("../assets/images/background.png")}
          style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
          resizeMode="cover"
        />
        <Image
          source={require("../assets/images/basket.png")}
          style={{
            width: SCREEN_WIDTH * 0.9,
            height: SCREEN_HEIGHT * 0.8,
            position: "absolute",
            top: SCREEN_HEIGHT - SCREEN_HEIGHT * 0.8,
            left: SCREEN_WIDTH / 2 - (SCREEN_WIDTH * 0.9) / 2,
          }}
          resizeMode="stretch"
        />
      </View>
      <Text style={styles.score}>Score: {score}</Text>

      <View style={styles.nextFruitContainer}>
        <Text style={styles.nextFruitLabel}>Next:</Text>
        {(() => {
          const nextRadius = FRUITS[nextFruitIndex].radius;
          const size = Math.min(80, Math.max(30, nextRadius * 2));
          const sprite = FRUITS[nextFruitIndex].sprite;
          return sprite ? (
            <Image
              source={sprite}
              style={{
                width: size,
                overflow: "visible",
                height: size,
                borderRadius: size / 2,
              }}
              resizeMode="center"
            />
          ) : (
            <View
              style={{
                width: size,
                height: size,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: FRUITS[nextFruitIndex].color,
                borderRadius: size / 2,
                borderWidth: 1,
                borderColor: "rgba(0,0,0,0.2)",
              }}
            >
              <Text style={{ fontSize: size * 0.6 }}>
                {FRUITS[nextFruitIndex].label}
              </Text>
            </View>
          );
        })()}
      </View>

      {entities && (
        <GameEngine
          ref={gameEngineRef}
          style={styles.gameContainer}
          systems={[Physics]}
          entities={entities}
          running={running}
          onEvent={(e: any) => {
            if (e.type === "SCORE_UPDATE") {
              setScore((s) => s + e.score);
              if (e.index > maxFruitIndex) {
                setMaxFruitIndex(e.index);
              }
            } else if (e.type === "GAME_OVER") {
              setRunning(false);
              onGameOver(score);
            } else if (e.type === "PLAY_SOUND") {
              if (e.name === "pop") {
                const s = popSoundRef.current;
                if (s) {
                  s.stopAsync()
                    .catch(() => {})
                    .then(() => {
                      s.setPositionAsync(0).catch(() => {});
                      s.playAsync().catch(() => {});
                    });
                }
              }
            } else if (e.type === "started") {
              setEngineReady(true);
              engineReadyRef.current = true;
            }
          }}
        />
      )}

      {!engineReady ? (
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: SCREEN_HEIGHT / 2 - 20,
            alignItems: "center",
            zIndex: 200,
          }}
          pointerEvents="none"
        >
          <View
            style={{
              backgroundColor: "rgba(255,255,255,0.9)",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "#333" }}>Starting...</Text>
            <Text style={{ color: "#666", fontSize: 12 }}>
              If this takes too long, try restarting the app.
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gameContainer: {
    flex: 1,
  },
  score: {
    position: "absolute",
    top: 30,
    left: 20,
    fontSize: 32,
    fontWeight: "bold",
    zIndex: 10,
    color: "#333",
  },
  nextFruitContainer: {
    position: "absolute",
    top: 60,
    right: 20,
    alignItems: "center",
    zIndex: 10,
  },
  nextFruitLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
});
