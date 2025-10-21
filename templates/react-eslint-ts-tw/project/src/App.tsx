function App() {
  return (
    <main className="container m-auto grid min-h-screen grid-rows-[auto_1fr_auto] px-4">
      <header className="text-xl leading-[4rem] font-bold">{{name}}</header>
      <section className="py-8">👋</section>
      <footer className="text-center leading-[4rem] opacity-70">
        © {new Date().getFullYear()} {{name}}
      </footer>
    </main>
  );
}

export default App;
