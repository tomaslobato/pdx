export type Message = {
  msg: string
  from: "model" | "user"
}

export interface FileData {
  id?: number
  name: string
  messages: Message[]
  content: ArrayBuffer
  thumbnail?: string
}

export async function initDB() {
  return new Promise((res, rej) => {
    const req = indexedDB.open("filesdb", 1)

    req.onerror = () => rej(req.error)
    req.onsuccess = () => res(req.result)

    req.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains("files")) {
        db.createObjectStore("files", {
          keyPath: "id",
          autoIncrement: true,
        })
      }
    }
  })
}

export async function uploadFile(file: File) {
  const content = await file.arrayBuffer()

  const fileData: FileData = {
    name: file.name,
    messages: [],
    content: content,
    thumbnail: undefined,
  }

  //open DB connection
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open("filesdb", 1)

    req.onerror = () => reject(req.error)
    req.onsuccess = () => resolve(req.result)
  })

  //save actual file
  const transaction = db.transaction(["files"], "readwrite")
  const store = transaction.objectStore("files")
  await new Promise<void>((resolve, reject) => {
    const req = store.add(fileData)
    req.onerror = () => reject(req.error)
    req.onsuccess = () => resolve()
  })
}

export async function getFile(id: number) {
  const db = (await initDB()) as IDBDatabase

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["files"], "readonly")
    const store = transaction.objectStore("files")
    const req = store.get(id)

    req.onerror = () => reject(req.error)
    req.onsuccess = () => resolve(req.result)
  })
}

export async function getFiles() {
  const db = (await initDB()) as IDBDatabase

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["files"], "readonly")
    const store = transaction.objectStore("files")
    const req = store.getAll()

    req.onerror = () => reject(req.error)
    req.onsuccess = () => resolve(req.result)
  })
}

export async function deleteFile(id: number) {
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open("filesdb", 1)

    req.onerror = () => reject(req.error)
    req.onsuccess = () => resolve(req.result)
  })

  const transaction = db.transaction(["files"], "readwrite")
  const store = transaction.objectStore("files")
  await new Promise<void>((resolve, reject) => {
    const req = store.delete(id)
    req.onerror = () => reject(req.error)
    req.onsuccess = () => resolve(req.result)
  })
}

export async function addThumbnail(id: number, thumbnail: string) {
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open("filesdb", 1)

    req.onerror = () => reject(req.error)
    req.onsuccess = () => resolve(req.result)
  })

  const transaction = db.transaction(["files"], "readwrite")
  const store = transaction.objectStore("files")
  await new Promise<void>((resolve, reject) => {
    const req = store.get(id)

    req.onerror = () => reject(req.error)
    req.onsuccess = () => {
      const fileData = req.result as FileData
      fileData.thumbnail = thumbnail

      const updateReq = store.put(fileData)
      updateReq.onerror = () => reject(updateReq.error)
      updateReq.onsuccess = () => resolve()
    }
  })
}
