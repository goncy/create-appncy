function App() {
  return (
    <main className="container m-auto grid min-h-screen grid-rows-[auto,1fr,auto] px-4">
      <header className="text-xl leading-16 font-bold">{{name}}</header>
      <section className="py-8">👋</section>
      <footer className="text-center leading-16 opacity-70">
        © {new Date().getFullYear()} {{name}}
      </footer>
    </main>
  );
}

export default App;
