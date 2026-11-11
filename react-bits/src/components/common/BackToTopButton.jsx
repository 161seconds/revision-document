import { Button, Icon } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { FiArrowUp } from 'react-icons/fi';
import { useReducedMotion } from 'motion/react';
import { toast } from 'sonner';

const MESSAGES = [
  '🐴  Country roads, take me home!',
  '🚀  To infinity and beyond!',
  '🦾  Get to the choppa!',
  '🚕  Grove Street, home...',
  '🐉  Fus Ro Dah!',
  '🍄  The princess is in another castle!',
  '🦸‍♂️  Avengers, assemble!',
  '🗡️  It’s dangerous to go alone! Take this.',
  '📜  A wizard is never late.',
  '💍  Foul Tarnished, in search of the Elden Ring!',
  '🐊  See you later, alligator.',
  '🔥  Dracarys!'
];

const randomMessage = () => MESSAGES[Math.floor(Math.random() * MESSAGES.length)];

const BackToTopButton = () => {
  const [visible, setVisible] = useState(false);
  const reduceMotion = useReducedMotion();

  const scrollToTop = () => {
    window.scrollTo(0, 0);
    toast(randomMessage());
  };

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <Button
      fontWeight={500}
      rounded="xl"
      boxSize="44px"
      minW="44px"
      p={0}
      position="fixed"
      zIndex={98}
      transition="opacity var(--transition-slow), transform var(--dur-press) var(--ease-out)"
      _active={reduceMotion ? undefined : { transform: 'scale(0.94)' }}
      className="back-to-top"
      opacity={visible ? 1 : 0}
      bottom={visible ? { base: '6em', md: '2.5em' } : '1em'}
      cursor={visible ? 'pointer' : 'default'}
      aria-hidden={!visible}
      aria-label="Back to top"
      onClick={() => visible && scrollToTop()}
    >
      <Icon as={FiArrowUp} color="var(--text-primary)" boxSize={4} />
    </Button>
  );
};

export default BackToTopButton;
