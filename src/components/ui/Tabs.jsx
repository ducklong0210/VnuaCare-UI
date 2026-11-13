/**
 * ==============================================================================
 * COMPONENT: Tabs
 * VAI TRÒ: 
 *   - Component bố cục tab đa năng (Component Composition / Slots Pattern)
 * THAM SỐ:
 *   - buttons: Tập hợp các nút bấm chuyển tab được truyền vào
 *   - children: Phần nội dung bên dưới (nếu có)
 *   - ButtonsContainer: Thẻ HTML bọc ngoài các nút (mặc định là 'menu', hoặc 'ul', 'div')
 *   - buttonsClassName: Tên class CSS áp dụng cho thẻ bọc
 * ==============================================================================
 */
export default function Tabs({
  buttons,
  children,
  ButtonsContainer = 'menu',
  buttonsClassName = '',
}) {
  const Container = ButtonsContainer

  return (
    <>
      <Container className={buttonsClassName}>
        {buttons}
      </Container>
      {children}
    </>
  )
}
