import BoardClass from "../common/BoardClass.ts";
import Protocol, { MoveStat } from "../common/Protocol.ts";
import { BoundedGoban, preact, tb } from "./deps.ts";
import { default as SignMap, FillSignMap } from "./SignMap.ts";

type Props = {
  api: tb.Implementation<typeof Protocol>;
};

type BaseState = {
  board: BoardClass;
};

type State = BaseState & {
  id: number;
  moveStats: null | MoveStat[];
};

export default class App extends preact.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.setBaseState({});
  }

  setBaseState(baseState: Partial<BaseState>) {
    const priorState: State = this.state ?? {
      id: 0,
      board: new BoardClass(9, 9, 5.5),
      moveStats: null,
    };

    const id = priorState.id + 1;

    const state: State = {
      ...priorState,
      ...baseState,
      id,
      moveStats: null,
    };

    this.props.api.findMoveStats(state.board.Board().hash.value.value)
      .then((moveStats) => {
        if (this.state.id === id) {
          this.setState({ moveStats });
        }
      });

    this.setState(state);
  }

  render(): preact.ComponentChild {
    const markerMap = FillSignMap<Marker>(9, 9, null);
    const ghostStoneMap = FillSignMap<GhostStone>(9, 9, null);

    for (const moveStat of this.state.moveStats ?? []) {
      if (moveStat.location === null) {
        continue;
      }

      const [x, y] = [moveStat.location.x - 1, moveStat.location.y - 1];

      markerMap[y][x] = {
        type: "label",
        label: moveStat.count.toString(),
      };
    }

    return preact.h(BoundedGoban, {
      maxWidth: 500,
      maxHeight: 500,
      signMap: SignMap(this.state.board),
      ghostStoneMap,
      markerMap,
      busy: this.state.moveStats === null,
      showCoordinates: true,
      onVertexClick: (_evt: unknown, [x, y]: [number, number]) => {
        x++;
        y++;

        const board = this.state.board.clone();
        board.play(x, y, board.data.colorToPlay);

        this.setBaseState({ board });
      },
    });
  }
}

type GhostStone = (
  | null
  | {
    sign: -1 | 0 | 1;
    type?: "good" | "interesting" | "doubtful" | "bad";
    faint?: boolean;
  }
);

type Marker = (
  | null
  | { type: "label"; label: string }
  | {
    type: (
      | "circle"
      | "cross"
      | "triangle"
      | "square"
      | "point"
      | "loader"
    );
  }
);
