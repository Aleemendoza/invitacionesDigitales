"use client";
import type { EventDraftInput } from "@/lib/event-drafts";
const DB="celebra-pending-event",STORE="draft",KEY="current";
export type PendingEventDraft={draft:EventDraftInput;photos:File[]};
function database(){return new Promise<IDBDatabase>((resolve,reject)=>{const request=indexedDB.open(DB,1);request.onupgradeneeded=()=>request.result.createObjectStore(STORE);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)})}
export async function savePendingEventDraft(value:PendingEventDraft){const db=await database();await new Promise<void>((resolve,reject)=>{const tx=db.transaction(STORE,"readwrite");tx.objectStore(STORE).put(value,KEY);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)})}
export async function readPendingEventDraft(){const db=await database();return new Promise<PendingEventDraft|undefined>((resolve,reject)=>{const request=db.transaction(STORE,"readonly").objectStore(STORE).get(KEY);request.onsuccess=()=>resolve(request.result as PendingEventDraft|undefined);request.onerror=()=>reject(request.error)})}
export async function clearPendingEventDraft(){const db=await database();await new Promise<void>((resolve,reject)=>{const tx=db.transaction(STORE,"readwrite");tx.objectStore(STORE).delete(KEY);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)})}
