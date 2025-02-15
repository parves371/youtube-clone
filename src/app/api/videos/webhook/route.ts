import { eq } from "drizzle-orm";
import {
  VideoAssetCreatedWebhookEvent,
  VideoAssetDeletedWebhookEvent,
  VideoAssetErroredWebhookEvent,
  VideoAssetReadyWebhookEvent,
  VideoAssetTrackReadyWebhookEvent,
} from "@mux/mux-node/resources/webhooks";
import { headers } from "next/headers";
import { mux } from "@/lib/mux";
import { db } from "@/db";
import { videos } from "@/db/schema";

const SIGNING_SECRET = process.env.MUX_WEBHOOK_SECRET!;

type WebhookEvent =
  | VideoAssetCreatedWebhookEvent
  | VideoAssetErroredWebhookEvent
  | VideoAssetReadyWebhookEvent
  | VideoAssetTrackReadyWebhookEvent
  | VideoAssetDeletedWebhookEvent;

export const POST = async (req: Request) => {
  if (!SIGNING_SECRET) {
    throw new Error("MUX_SIGNING_SECRET is not set");
  }

  const headersPalyload = await headers();
  const muxSignature = headersPalyload.get("mux-signature");

  if (!muxSignature) {
    return new Response("Missing mux-signature header", { status: 401 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  mux.webhooks.verifySignature(
    body,
    {
      "mux-signature": muxSignature,
    },
    SIGNING_SECRET
  );

  switch (payload.type as WebhookEvent["type"]) {
    case "video.asset.created": {
      const data = payload.data as VideoAssetCreatedWebhookEvent["data"];

      if (!data.upload_id) {
        return new Response("Missing upload_id", { status: 400 });
      }

      if (!data.upload_id) {
        return new Response("Missing upload_id", { status: 400 });
      }

      await db
        .update(videos)
        .set({
          muxAssetId: data.id,
          muxStatus: data.status,
        })
        .where(eq(videos.muxUploadId, data.upload_id));
      break;
    }
    case "video.asset.ready": {
      const data = payload.data as VideoAssetReadyWebhookEvent["data"];
      const PlaybackId = data.playback_ids?.[0]?.id;
      const uploadId = data.upload_id; // Get upload_id

      if (!PlaybackId) {
        return new Response("Missing playback_id", { status: 400 });
      }
      if (!uploadId) {
        // Check if uploadId exists
        return new Response("Missing upload_id in webhook payload", {
          status: 400,
        });
      }

      const thumbnailUrl = `https://image.mux.com/${PlaybackId}/thumbnail.jpg`;
      const previewUrl = `https://image.mux.com/${PlaybackId}/animated.gif`;
      const duration = data.duration ? Math.round(data.duration * 1000) : 0;

      await db
        .update(videos)
        .set({
          muxStatus: data.status,
          muxPlaybackId: PlaybackId,
          muxAssetId: data.id,
          thumbnailUrl,
          previewUrl,
          duration,
        })
        .where(eq(videos.muxUploadId, uploadId));

      break;
    }
    case "video.asset.errored": {
      const data = payload.data as VideoAssetErroredWebhookEvent["data"];
      const uploadId = data.upload_id; // Get upload_id

      if (!uploadId) {
        // Check if uploadId exists
        return new Response("Missing upload_id in webhook payload", {
          status: 400,
        });
      }

      await db
        .update(videos)
        .set({
          muxStatus: data.status,
        })
        .where(eq(videos.muxUploadId, uploadId));

      break;
    }
    case "video.asset.deleted": {
      const data = payload.data as VideoAssetDeletedWebhookEvent["data"];
      const uploadId = data.upload_id; // Get upload_id

      if (!uploadId) {
        // Check if uploadId exists
        return new Response("Missing upload_id in webhook payload", {
          status: 400,
        });
      }
      await db.delete(videos).where(eq(videos.muxUploadId, uploadId));
      break;
    }
    case "video.asset.track.ready": {
      const data = payload.data as VideoAssetTrackReadyWebhookEvent["data"] & {
        asset_id: string;
      };
      console.log("traking f")
      // typrscript incorrectly says that asset_id does not exit
      const assetId = data.asset_id; // Get upload_id
      const trackId = data.id; // Get upload_id
      const staus = data.status; // Get upload_id
      if (!assetId) {
        // Check if uploadId exists
        return new Response("Missing asset_id in webhook payload", {
          status: 400,
        });
      }

      await db
        .update(videos)
        .set({
          muxTrackId: trackId,
          muxTrackStatus: staus,
        })
        .where(eq(videos.muxAssetId, assetId));
      break;
    }
  }

  return new Response("webhook received", { status: 200 });
};
