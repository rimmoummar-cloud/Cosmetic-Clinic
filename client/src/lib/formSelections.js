export function getSelectedOptionIds(question) {
  return question.question_type === "multi_select"
    ? (question.answer?.selected_option_ids || [])
    : question.answer?.selected_option_id != null ? [question.answer.selected_option_id] : [];
}

export function getSelectedOptionLabels(question) {
  const selected = new Set(getSelectedOptionIds(question).map(String));
  return (question.options || []).filter((option) => selected.has(String(option.id)))
    .map((option) => option.option_label);
}
