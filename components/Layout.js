import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Layout = ({ children, hideHeader = false, hideFooter = false }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {!hideHeader && <Header />}
      <main className="flex-grow">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
};

export default Layout; 