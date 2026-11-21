//
// Component bọc thanh điều hướng dạng Tab có thể tái sử dụng
// Nhận danh sách nút buttons và nội dung children để render linh hoạt cho Sidebar và các cụm Tab
//

export default function Tabs({ buttons, children, ButtonsContainer = 'menu', buttonsClassName = '' }) {
  const Container = ButtonsContainer;

  return (
    <>
      <Container className={buttonsClassName}>{buttons}</Container>
      {children}
    </>
  );
}
