'use client';

import { useState } from 'react';

export default function HeaderWithSidebar(props: any) {
  const showSearch = props.showSearch || false;
  const searchQuery = props.searchQuery || '';
  const onSearchChange = props.onSearchChange;
  const propShowCategories = props.showCategories;
  const propSetShowCategories = props.setShowCategories;
  const propCategories = props.categories;
  const isSidebarOpen = props.isSidebarOpen || false;
  const [internalShowCategories, setInternalShowCategories] = useState(false);
  const showCategories = propShowCategories !== undefined ? propShowCategories : internalShowCategories;
  const setShowCategories = propSetShowCategories || setInternalShowCategories;

  const categories = propCategories || ['Computer Service', 'Restaurant'];

  return (
    <div>
       <header className={`flex justify-between items-center py-3 w-full bg-gray-100 ${isSidebarOpen ? 'lg:mr-64' : ''}`} style={{ backgroundImage: 'url(/uploads/1n.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}>
        <div className="flex items-center space-x-2 px-6">
          <button
            className="text-2xl"
            onClick={() => setShowCategories(!showCategories)}
          >
            ☰
          </button>
          {showSearch && (
            <input
              type="text"
              placeholder="Search"
              className="border bg-white px-2 py-1"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
            />
          )}
        </div>
      </header>

      <aside className={`fixed top-30.5 h-full w-64 bg-white shadow-lg z-50 p-4 overflow-y-auto transform transition-transform duration-300 ease-in-out ${showCategories ? 'translate-x-0' : '-translate-x-full'}`} style={{ left: isSidebarOpen ? '-256px' : '0px' }}>
        <button
          onClick={() => setShowCategories(false)}
          className="text-2xl mb-4 hover:text-gray-600"
        >
          ×
        </button>
        <div className="space-y-2">
          <button
            onClick={() => {
              setShowCategories(false);
              window.location.href = '/';
            }}
            className="block w-full text-left px-4 py-2 rounded-md bg-gray-100 hover:bg-blue-200 text-gray-700"
          >
            All Categories
          </button>
          {categories.map((category: string) => (
            <button
              key={category}
              onClick={() => {
                setShowCategories(false);
                window.location.href = `/?category=${category}`;
              }}
              className="block w-full text-left px-4 py-2 rounded-md bg-gray-100 hover:bg-blue-200 text-gray-700"
            >
              {category}
            </button>
          ))}
        </div>
      </aside>

      {showCategories && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setShowCategories(false)}
        />
      )}
    </div>
  );
}