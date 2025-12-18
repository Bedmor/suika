import { FruitRenderer } from "@/components/game/renderers";
import { DEADLINE_Y, FRUITS } from "@/constants/game";
import Matter from "matter-js";

export const Physics = (entities: any, { time, dispatch, events }: any) => {
  const engine = entities.physics.engine;

  // Handle events to add bodies (from taps)
  if (events.length) {
    events.forEach((e: any) => {
      if (e.type === "ADD_BODY") {
        entities[e.id] = {
          body: e.body,
          fruitIndex: e.body.fruitIndex,
          renderer: FruitRenderer,
        };
      }
    });
  }

  // Use a fixed timestep with an accumulator so physics keeps up even when FPS drops.
  // We advance the physics by the actual elapsed time (time.delta) using multiple
  // fixed-size steps (<= 16.667ms) per frame. This prevents physics from slowing
  // down when the rendering FPS is low (spiral-of-death guarded by a cap).
  const dt = 1000 / 60; // ~16.667ms
  const elapsed = typeof time.delta === "number" ? time.delta : dt;
  // store accumulator on the engine so it persists between frames
  // @ts-ignore
  engine._accumulator = (engine._accumulator || 0) + elapsed;
  // Cap accumulated time to avoid spiraling if the app was backgrounded or blocked
  const MAX_ACCUM = 250; // ms
  // @ts-ignore
  if (engine._accumulator > MAX_ACCUM) engine._accumulator = MAX_ACCUM;

  // Step the physics in fixed dt increments until we've caught up
  // @ts-ignore
  while (engine._accumulator >= dt) {
    Matter.Engine.update(engine, dt);
    // @ts-ignore
    engine._accumulator -= dt;
  }

  // Process merge queue populated by engine collisionStart handler
  // This avoids running a full broad-phase detection each frame and is much cheaper.
  // @ts-ignore
  if (engine.mergeQueue && engine.mergeQueue.length) {
    // Drain the queue
    // @ts-ignore
    const queue = engine.mergeQueue.splice(0, engine.mergeQueue.length);
    queue.forEach((item: any) => {
      const { bodyA, bodyB } = item;
      if (!bodyA || !bodyB) return;
      if (bodyA.label === "Fruit" && bodyB.label === "Fruit") {
        // @ts-ignore
        if (bodyA.fruitIndex === bodyB.fruitIndex) {
          // @ts-ignore
          if (!bodyA.isMerged && !bodyB.isMerged) {
            // Find entity keys
            const keyA = Object.keys(entities).find(
              (k) => entities[k].body === bodyA
            );
            const keyB = Object.keys(entities).find(
              (k) => entities[k].body === bodyB
            );

            if (keyA && keyB) {
              // @ts-ignore
              bodyA.isMerged = true;
              // @ts-ignore
              bodyB.isMerged = true;

              // Remove old bodies
              delete entities[keyA];
              delete entities[keyB];
              Matter.World.remove(engine.world, [bodyA, bodyB]);

              const newIndex = bodyA.fruitIndex + 1;
              if (newIndex < FRUITS.length) {
                const newX = (bodyA.position.x + bodyB.position.x) / 2;
                const newY = (bodyA.position.y + bodyB.position.y) / 2;
                const newFruit = FRUITS[newIndex];

                const newBody = Matter.Bodies.circle(
                  newX,
                  newY,
                  newFruit.radius,
                  {
                    label: "Fruit",
                    restitution: 0.2,
                    friction: 0.1,
                    isStatic: false,
                  }
                );
                // @ts-ignore
                newBody.fruitIndex = newIndex;
                Matter.World.add(engine.world, newBody);
                // Give a random initial orientation and spin so merged fruits rotate
                Matter.Body.setAngle(newBody, Math.random() * Math.PI * 2);
                Matter.Body.setAngularVelocity(
                  newBody,
                  (Math.random() - 0.5) * 0.4
                );

                const id = `fruit_${Date.now()}_${Math.random()}`;
                entities[id] = {
                  body: newBody,
                  fruitIndex: newIndex,
                  renderer: FruitRenderer,
                };

                dispatch({
                  type: "SCORE_UPDATE",
                  score: newFruit.score,
                  index: newIndex,
                });
                // Play merge pop sound
                dispatch({ type: "PLAY_SOUND", name: "pop" });
              }
            }
          }
        }
      }
    });
  }

  // Check Game Over
  Object.keys(entities).forEach((key) => {
    const entity = entities[key];
    if (entity.body && entity.body.label === "Fruit") {
      const body = entity.body;
      // If fruit is above deadline
      if (body.position.y - body.circleRadius < DEADLINE_Y) {
        // Check if it's not the spawning fruit
        // @ts-ignore
        if (!body.isSpawning) {
          // Check if it's stable or just momentarily up there?
          // Usually if it stays there. For now, let's just check if it's not spawning.
          // But we need to clear isSpawning flag.
          // If it falls below deadline, clear flag.
        } else {
          if (body.position.y - body.circleRadius > DEADLINE_Y + 30) {
            // @ts-ignore
            body.isSpawning = false;
          }
        }
      } else {
        // @ts-ignore
        if (body.isSpawning) body.isSpawning = false;
      }

      // Real Game Over Check
      // If not spawning and above line
      // @ts-ignore
      if (
        !body.isSpawning &&
        body.position.y - body.circleRadius < DEADLINE_Y
      ) {
        // Maybe check velocity to ensure it's settled?
        if (body.speed < 0.15) {
          dispatch({ type: "GAME_OVER" });
        }
      }
    }
  });

  return entities;
};
