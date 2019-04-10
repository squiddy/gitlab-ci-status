import React from 'react';
import renderer from 'react-test-renderer';

import { Avatar } from '../Avatar';

it('Avatar renders empty when no data is available', () => {
  const tree = renderer.create(<Avatar />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Avatar renders correctly with relative image URL', () => {
  const tree = renderer
    .create(<Avatar obj={{ avatar_url: '/kitten.jpg' }} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Avatar renders correctly with absolute image URL', () => {
  const tree = renderer
    .create(<Avatar obj={{ avatar_url: 'http://example.com/kitten.jpg' }} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
