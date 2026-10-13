import { RoomShell } from './RoomShell'
import { Window } from '../furniture/Window'
import { Door } from '../furniture/Door'
import { Bed } from '../furniture/Bed'
import { Bookshelf } from '../furniture/Bookshelf'
import { Wardrobe } from '../furniture/Wardrobe'
import { Desk } from '../furniture/Desk'
import { Chair } from '../furniture/Chair'
import { Rug } from '../furniture/Rug'
import { Poster, WallFrames } from '../furniture/WallDecor'
import { DeskBooks, DeskLamp, DeskNotebook, PenHolder, Phone, Trophy } from '../furniture/Props'
import { Character } from '../furniture/CharacterPlaceholder'

export function Room() {
  return (
    <group name="room">
      <RoomShell />
      <Window />
      <Door />

      <Bed />
      <Bookshelf />
      <Wardrobe />
      <Desk />
      <Chair />
      <Rug />

      <Poster />
      <WallFrames />

      <Trophy />
      <DeskLamp />
      <DeskBooks />
      <DeskNotebook />
      <PenHolder />
      <Phone />

      <Character />
    </group>
  )
}
