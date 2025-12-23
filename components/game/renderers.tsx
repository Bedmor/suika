import { DEADLINE_Y, FRUITS } from "@/constants/game";
import React, { useEffect, useRef } from "react";
import { Animated, Image, Text, View } from "react-native";

export const FruitRenderer = (props: any) => {
  const { body, fruitIndex } = props;
  const { position } = body;
  // Matter.js bodies have a circleRadius if created as circles
  const radius = body.circleRadius;

  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  // Hide sprite if flagged invisible (bombed)
  // @ts-ignore
  if (body?.isHidden) return null;

  if (!FRUITS[fruitIndex]) return null;

  const x = position.x - radius;
  const y = position.y - radius;
  const DEBUG_HITBOX = false; // set to true to visualize physics circle hitboxes

  // spriteScale: allow sprite to be slightly larger than the physics circle
  const spriteScale = (FRUITS[fruitIndex] as any).spriteScale ?? 1.12;
  const spriteSize = radius * 2 * spriteScale;
  const spriteOffset = (radius * 2 - spriteSize) / 2;

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: radius * 2,
        height: radius * 2,
        borderRadius: radius,
        overflow: "visible", // allow sprite to overflow the physics hitbox
        justifyContent: "center",
        alignItems: "center",
        transform: [{ scale: scaleAnim }],
      }}
    >
      {FRUITS[fruitIndex].sprite ? (
        <Image
          source={FRUITS[fruitIndex].sprite}
          style={[
            {
              position: "absolute",
              left: spriteOffset,
              top: spriteOffset,
              width: spriteSize,
              height: spriteSize,
              overflow: "visible",
            },
            { transform: [{ rotate: `${body.angle}rad` }] },
          ]}
          resizeMode="contain"
        />
      ) : (
        <View
          style={{
            position: "absolute",
            left: spriteOffset,
            top: spriteOffset,
            width: spriteSize,
            height: spriteSize,
            borderRadius: spriteSize / 2,
            backgroundColor: FRUITS[fruitIndex].color,
            justifyContent: "center",
            alignItems: "center",
            transform: [{ rotate: `${body.angle}rad` }],
            borderWidth: 2,
            borderColor: "rgba(0,0,0,0.1)",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
            elevation: 3,
          }}
        >
          <Text
            style={{
              fontSize: radius * 1.2,
              textShadowColor: "rgba(0,0,0,0.2)",
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 2,
            }}
          >
            {FRUITS[fruitIndex].label}
          </Text>
        </View>
      )}

      {DEBUG_HITBOX && (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: radius * 2,
            height: radius * 2,
            borderRadius: radius,
            borderWidth: 1,
            borderColor: "rgba(255,0,0,0.75)",
          }}
        />
      )}
    </Animated.View>
  );
};

export const WallRenderer = (props: any) => {
  const { body, size } = props;
  const { position } = body;

  const width = size[0];
  const height = size[1];
  const x = position.x - width / 2;
  const y = position.y - height / 2;

  return (
    <View
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: width,
        height: height,
        backgroundColor: "transparent",
      }}
    />
  );
};

export const DeadlineRenderer = () => {
  return (
    <View
      style={{
        position: "absolute",
        top: DEADLINE_Y,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: "rgba(255, 0, 0, 0.4)",
        borderStyle: "dashed",
        zIndex: 5,
      }}
    />
  );
};

export const MergeEffectRenderer = (props: any) => {
  const { x, y, radius } = props;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 2.5,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: x - radius,
        top: y - radius,
        width: radius * 2,
        height: radius * 2,
        borderRadius: radius,
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        transform: [{ scale: scaleAnim }],
        opacity: opacityAnim,
        zIndex: 100,
      }}
    />
  );
};

export const BombEffectRenderer = (props: any) => {
  const { x, y, radius } = props;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 3,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: x - radius,
        top: y - radius,
        width: radius * 2,
        height: radius * 2,
        borderRadius: radius,
        backgroundColor: "rgba(255, 100, 50, 0.9)",
        borderWidth: 3,
        borderColor: "rgba(255, 200, 100, 1)",
        transform: [{ scale: scaleAnim }],
        opacity: opacityAnim,
        zIndex: 101,
      }}
    />
  );
};
