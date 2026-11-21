import {
  BizDocConfig,
  BizDocRecord,
  BizDocTemplateVersion,
} from './types';
import { createInitialConfig } from './constants';

const DB_NAME = 'bizdoc_mini_v2_db';
const DB_VERSION = 1;

const STORE_CONFIGS = 'configs';
const STORE_TEMPLATE_META = 'template_versions';
const STORE_TEMPLATE_FILES = 'template_binaries';
const STORE_RECORDS = 'records';

interface StoredTemplateBinary {
  versionKey: string;
  buffer: ArrayBuffer;
  savedAt: string;
}

const openDb = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('Trình duyệt không hỗ trợ IndexedDB để lưu dữ liệu cục bộ.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error(request.error?.message || 'Không thể mở cơ sở dữ liệu cục bộ IndexedDB.'));
    };

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_CONFIGS)) {
        db.createObjectStore(STORE_CONFIGS, { keyPath: 'configVersion' });
      }
      if (!db.objectStoreNames.contains(STORE_TEMPLATE_META)) {
        db.createObjectStore(STORE_TEMPLATE_META, { keyPath: 'versionKey' });
      }
      if (!db.objectStoreNames.contains(STORE_TEMPLATE_FILES)) {
        db.createObjectStore(STORE_TEMPLATE_FILES, { keyPath: 'versionKey' });
      }
      if (!db.objectStoreNames.contains(STORE_RECORDS)) {
        db.createObjectStore(STORE_RECORDS, { keyPath: 'recordId' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
  });
};

const runTransaction = <T>(
  storeNames: string[],
  mode: IDBTransactionMode,
  executor: (tx: IDBTransaction) => Promise<T> | T
): Promise<T> => {
  return new Promise((resolve, reject) => {
    openDb()
      .then((db) => {
        const tx = db.transaction(storeNames, mode);
        let resultValue: T;

        tx.oncomplete = () => {
          db.close();
          resolve(resultValue);
        };
        tx.onerror = () => {
          db.close();
          reject(new Error(tx.error?.message || 'Lỗi giao dịch IndexedDB.'));
        };
        tx.onabort = () => {
          db.close();
          reject(new Error(tx.error?.message || 'Giao dịch IndexedDB bị hủy.'));
        };

        Promise.resolve(executor(tx))
          .then((res) => {
            resultValue = res;
          })
          .catch((err) => {
            try {
              tx.abort();
            } catch {
              // ignore abort error
            }
            reject(err);
          });
      })
      .catch(reject);
  });
};

const reqToPromise = <T>(req: IDBRequest<T>): Promise<T> => {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(new Error(req.error?.message || 'Lỗi truy vấn IndexedDB.'));
  });
};

export const loadAllConfigs = async (): Promise<BizDocConfig[]> => {
  const configs = await runTransaction([STORE_CONFIGS], 'readonly', (tx) =>
    reqToPromise(tx.objectStore(STORE_CONFIGS).getAll() as IDBRequest<BizDocConfig[]>)
  );
  if (configs.length === 0) {
    const initial = createInitialConfig();
    await saveConfig(initial);
    return [initial];
  }
  return configs.sort((a, b) => a.configVersion - b.configVersion);
};

export const saveConfig = async (config: BizDocConfig): Promise<void> => {
  await runTransaction([STORE_CONFIGS], 'readwrite', (tx) =>
    reqToPromise(tx.objectStore(STORE_CONFIGS).put(config))
  );
};

export const loadAllTemplateVersions = async (): Promise<BizDocTemplateVersion[]> => {
  const list = await runTransaction([STORE_TEMPLATE_META], 'readonly', (tx) =>
    reqToPromise(tx.objectStore(STORE_TEMPLATE_META).getAll() as IDBRequest<BizDocTemplateVersion[]>)
  );
  return list.sort((a, b) => {
    if (a.templateId !== b.templateId) return a.templateId.localeCompare(b.templateId);
    return b.version - a.version;
  });
};

export const saveTemplateVersion = async (
  meta: BizDocTemplateVersion,
  fileBuffer?: ArrayBuffer
): Promise<void> => {
  const stores = fileBuffer
    ? [STORE_TEMPLATE_META, STORE_TEMPLATE_FILES]
    : [STORE_TEMPLATE_META];

  await runTransaction(stores, 'readwrite', async (tx) => {
    await reqToPromise(tx.objectStore(STORE_TEMPLATE_META).put(meta));
    if (fileBuffer) {
      const bin: StoredTemplateBinary = {
        versionKey: meta.versionKey,
        buffer: fileBuffer,
        savedAt: new Date().toISOString(),
      };
      await reqToPromise(tx.objectStore(STORE_TEMPLATE_FILES).put(bin));
    }
  });
};

export const loadTemplateBinary = async (versionKey: string): Promise<ArrayBuffer | null> => {
  const item = await runTransaction([STORE_TEMPLATE_FILES], 'readonly', (tx) =>
    reqToPromise(
      tx.objectStore(STORE_TEMPLATE_FILES).get(versionKey) as IDBRequest<
        StoredTemplateBinary | undefined
      >
    )
  );
  return item?.buffer ?? null;
};

export const deleteTemplateVersionFromDb = async (versionKey: string): Promise<void> => {
  await runTransaction([STORE_TEMPLATE_META, STORE_TEMPLATE_FILES], 'readwrite', async (tx) => {
    await reqToPromise(tx.objectStore(STORE_TEMPLATE_META).delete(versionKey));
    await reqToPromise(tx.objectStore(STORE_TEMPLATE_FILES).delete(versionKey));
  });
};

export const loadAllRecords = async (): Promise<BizDocRecord[]> => {
  const list = await runTransaction([STORE_RECORDS], 'readonly', (tx) =>
    reqToPromise(tx.objectStore(STORE_RECORDS).getAll() as IDBRequest<BizDocRecord[]>)
  );
  return list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
};

export const loadRecordById = async (recordId: string): Promise<BizDocRecord | null> => {
  const item = await runTransaction([STORE_RECORDS], 'readonly', (tx) =>
    reqToPromise(
      tx.objectStore(STORE_RECORDS).get(recordId) as IDBRequest<BizDocRecord | undefined>
    )
  );
  return item ?? null;
};

export const saveRecordToDb = async (record: BizDocRecord): Promise<void> => {
  await runTransaction([STORE_RECORDS], 'readwrite', (tx) =>
    reqToPromise(tx.objectStore(STORE_RECORDS).put(record))
  );
};

export const deleteRecordFromDb = async (recordId: string): Promise<void> => {
  await runTransaction([STORE_RECORDS], 'readwrite', (tx) =>
    reqToPromise(tx.objectStore(STORE_RECORDS).delete(recordId))
  );
};

export const clearAllLocalBizDocData = async (): Promise<void> => {
  await runTransaction(
    [STORE_CONFIGS, STORE_TEMPLATE_META, STORE_TEMPLATE_FILES, STORE_RECORDS],
    'readwrite',
    async (tx) => {
      await reqToPromise(tx.objectStore(STORE_CONFIGS).clear());
      await reqToPromise(tx.objectStore(STORE_TEMPLATE_META).clear());
      await reqToPromise(tx.objectStore(STORE_TEMPLATE_FILES).clear());
      await reqToPromise(tx.objectStore(STORE_RECORDS).clear());
    }
  );
};
