
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
