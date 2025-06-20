import { Ref } from 'vue';

function useCrudStore<T>(entries: Ref<T[]>, indexFilter: ((item: T) => boolean) | null = null) {
  function find(id: string | number) {
    const entry = entries.value.find((entry) => entry.uid === id);
    if (!entry) {
      return Promise.reject(new Error('Entry not found.'));
    }

    return Promise.resolve(entry);
  }

  function create(data: T) {
    entries.value.push(data);

    return Promise.resolve(data);
  }
  async function update(id: string | number, data: Partial<T>) {
    const entry = await find(id);

    Object.assign(entry, data);

    return entry;
  }
  function remove(id: string | number) {
    entries.value.splice(entries.value.findIndex((entry) => entry.uid === id), 1);

    return Promise.resolve();
  }

  function index(params: object = {}, config?: object) {
    let filteredItems = entries.value;
    if (indexFilter) {
      filteredItems = filteredItems.filter(indexFilter);
    }

    return Promise.resolve({
      data: filteredItems,
      meta: {
        total: filteredItems.length,
        per_page: filteredItems.length,
        current_page: 1,
        last_page: 1,
        from: filteredItems.length ? 1 : null,
        to: filteredItems.length || null,
      },
    });
  }

  return {
    find,
    create,
    update,
    remove,
    index,
  };
}

export {
  useCrudStore,
};
