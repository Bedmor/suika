import { DEADLINE_Y, FRUITS } from "@/constants/game";
import React from "react";
import { Image, Text, View } from "react-native";

export const FruitRenderer = (props: any) => {
  const { body, fruitIndex } = props;
  const { position } = body;
  // Matter.js bodies have a circleRadius if created as circles
  const radius = body.circleRadius;

  if (!FRUITS[fruitIndex]) return null;

  const x = position.x - radius;
  const y = position.y - radius;
  const DEBUG_HITBOX = false; // set to true to visualize physics circle hitboxes

  // spriteScale: allow sprite to be slightly larger than the physics circle
  const spriteScale = (FRUITS[fruitIndex] as any).spriteScale ?? 1.12;
  const spriteSize = radius * 2 * spriteScale;
  const spriteOffset = (radius * 2 - spriteSize) / 2;

  return (
    <View
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
          }}
        >
          <Text style={{ fontSize: radius * 1.2 }}>
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
    </View>
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
      }}
    />
  );
};

export const DeadlineRenderer = () => {
  return (
    <View
      style={{
        position: "absolute",
        top: DEADLINE_Y, // DEADLINE_Y
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: "rgba(255, 0, 0, 0.5)",
        borderStyle: "dashed",
        borderWidth: 1,
        borderColor: "red",
        zIndex: 5,
      }}
    />
  );
};
