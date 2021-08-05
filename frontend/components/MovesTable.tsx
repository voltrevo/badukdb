import { Color } from "../../common/BoardClass.ts";
import { MoveStat } from "../../common/IDatabase.ts";
import PrettyLocation from "../../common/PrettyLocation.ts";
import { preact, preact as React } from "../deps.ts";

type Props = {
  width: number;
  moveStats: MoveStat[] | null;
};

type State = { _empty?: true };

export default class MovesTable extends preact.Component<Props, State> {
  render() {
    const { moveStats, width } = this.props;

    if (!moveStats) {
      return <>Loading</>;
    }

    return <table class="moves-table">
      {moveStats
        .sort((a, b) => b.count - a.count)
        .map(
          (moveStat) => {
            return <tr>
              <td>
                <b>{PrettyLocation(width, moveStat.location)}</b>
              </td>
              <td style={{ textAlign: "right" }}>
                {
                  // FIXME: duplication
                  moveStat.color === "black"
                    ? moveStat.result
                    : moveStat.count - moveStat.result
                }/{moveStat.count}
              </td>
              <td>{renderDetail(moveStat.color, moveStat.detail)}</td>
            </tr>;
          },
        )}
    </table>;
  }
}

function renderDetail(
  color: Color,
  detail: MoveStat["detail"],
): preact.JSX.Element {
  if (detail === null) {
    return <></>;
  }

  return <>
    {detail.map(({ result, externalId }, i): preact.JSX.Element => {
      const sidedResult = color === "black" ? result : 1 - result;

      const renderColor = sidedResult === 0
        ? "red"
        : sidedResult === 1
        ? "green"
        : "black";

      return <>
        {i === 0 ? "" : ", "}
        <span style={{ color: renderColor }}>{externalId}</span>
      </>;
    })}
  </>;
}