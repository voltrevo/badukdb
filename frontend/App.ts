import BoardTree from "../common/BoardTree.ts";
import type ExplicitAny from "../common/helpers/ExplicitAny.ts";
import Protocol, { MoveStat } from "../common/Protocol.ts";
import { BoundedGoban, preact, tb } from "./deps.ts";
import { default as SignMap, FillSignMap } from "./SignMap.ts";

type Props = {
  api: tb.Implementation<typeof Protocol>;
};

type BaseState = {
  board: BoardTree;
  width?: number;
  height?: number;
};

type State = BaseState & {
  id: number;
  moveStats: null | MoveStat[];
};

export default class App extends preact.Component<Props, State> {
  containerRef: HTMLDivElement | null = null;
  resizeListener: (() => void) | null = null;
  keydownListener: ((evt: KeyboardEvent) => void) | null = null;

  constructor(props: Props) {
    super(props);

    this.setBaseState({});
  }

  componentDidMount() {
    this.keydownListener = (evt) => {
      if (evt.key === "ArrowLeft") {
        this.setBaseState({
          board: this.state.board.parent ?? this.state.board,
        });
      }
    };

    window.addEventListener("keydown", this.keydownListener);

    this.resizeListener = () => {
      if (this.containerRef) {
        const rect = this.containerRef.getBoundingClientRect();

        this.setBaseState({
          width: rect.width,
          height: rect.height,
        });
      }
    };

    window.addEventListener("resize", this.resizeListener);
  }

  componentWillUnmount() {
    if (this.keydownListener) {
      window.removeEventListener("keydown", this.keydownListener);
    }

    if (this.resizeListener) {
      window.removeEventListener("resize", this.resizeListener);
    }
  }

  setBaseState(baseState: Partial<BaseState>) {
    const priorState: State = this.state ?? {
      id: 0,
      board: new BoardTree(9, 9, 5.5),
      moveStats: null,
    };

    const id = priorState.id + 1;

    const state: State = {
      ...priorState,
      ...baseState,
      id,
    };

    if ("board" in baseState || state.moveStats === null) {
      state.moveStats = null;

      this.props.api.findMoveStats(state.board.board.Board().hash.value.value)
        .then((moveStats) => {
          if (this.state.id === id) {
            this.setState({ moveStats });
          }
        });
    }

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

    for (const { lastMove } of this.state.board.children) {
      const location = lastMove?.location;

      if (location) {
        const x = location.x - 1;
        const y = location.y - 1;

        markerMap[y][x] ??= {
          type: "label",
          label: "",
        };
      }
    }

    if (this.state.board.lastMove?.location) {
      const { x, y } = this.state.board.lastMove.location;
      markerMap[y - 1][x - 1] = { type: "point" };
    }

    const goban = preact.h(BoundedGoban, {
      maxWidth: this.state.width ?? 500,
      maxHeight: this.state.height ?? 500,
      signMap: SignMap(this.state.board.board),
      ghostStoneMap,
      markerMap,
      busy: this.state.moveStats === null,
      showCoordinates: true,
      onVertexClick: (_evt: unknown, [x, y]: [number, number]) => {
        x++;
        y++;

        this.setBaseState({
          board: this.state.board.play(
            x,
            y,
            this.state.board.board.data.colorToPlay,
          ),
        });
      },
    });

    return preact.h(
      "div",
      {
        class: `${this.state.board.board.data.colorToPlay}-to-play`,
        style: {
          width: "100%",
          height: "100%",
        },
        ref: ((el: HTMLDivElement) => {
          this.containerRef = el;

          if (this.state.width === undefined) {
            this.resizeListener?.();
          }
        }) as ExplicitAny,
      },
      goban,
    );
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
