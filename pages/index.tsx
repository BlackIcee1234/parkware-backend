import Header from "../components/common/Header";
import OrdersComponent from "@components/order/OrdersList";
import Banner from "@components/home/Banner";

const IndexPage = () => {
  return (
    <>
      <Header />
      <Banner/>
      <OrdersComponent />
    </>
  );
};

export default IndexPage;
